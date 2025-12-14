import feedparser
import concurrent.futures
from datetime import datetime, timezone, timedelta
from config import TOPICS
from src.fetcher import get_rss_url, fetch_article_content
from src.analyzer import analyze_article
from src.analyzer import analyze_article
from src.storage import load_db, save_db # Still importing for now but will remove usage
from src.database import get_known_links, add_article
from src.deduplicator import deduplicate_articles

def process_entry_workflow(entry, known_links, topic_name, page_id):
    """
    Workflow for processing a single entry:
    1. Check if known
    2. Fetch Content (Resolve + Scrape)
    3. Analyze (AI)
    """
    
    # Fetch content (Network heavy)
    content_data = fetch_article_content(entry, known_links)
    if not content_data:
        return None
        
    final_url = content_data['final_url']
    text = content_data['text']
    original_link = content_data['original_link']

    # Analyze (AI heavy)
    analysis = analyze_article(text, entry.title, topic_name)
    
    if not analysis or not analysis['is_relevant']:
        return None
        
    return {
        "entry": entry,
        "original_link": original_link,
        "final_url": final_url,
        "text": text,
        "analysis": analysis,
        "page_id": page_id,
        "article_dt": datetime(*entry.published_parsed[:6]) if hasattr(entry, 'published_parsed') else datetime.now()
    }

def main():
    print("🤖 Bot waking up...")
    
    # 1. Read existing DB (Deprecated)
    # db = load_db() 
    # Migration logic removed.
    
    # Collect all known links from DB
    known_links = get_known_links()
    print(f"📂 Loaded {len(known_links)} known links from database.")

    # 2. Fetch RSS for all topics
    entries_to_process = []
    
    today_utc = datetime.now(timezone.utc).date()
    cutoff_date = today_utc - timedelta(days=7)
    print(f"📅 Filtering for articles published after: {cutoff_date}")

    for topic in TOPICS:
        print(f"\nww Fetching RSS feed for: {topic['topic_name']} ({topic['page_id']})...")
        rss_url = get_rss_url(topic['query'])
        try:
             feed = feedparser.parse(rss_url)
             print(f"   Found {len(feed.entries)} articles.")
        except Exception as e:
             print(f"   ❌ Error fetching RSS for {topic['topic_name']}: {e}")
             continue

        for entry in feed.entries:
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                article_dt = datetime(*entry.published_parsed[:6])
                if article_dt.date() >= cutoff_date:
                    entries_to_process.append((entry, topic['topic_name'], topic['page_id']))
                else:
                    pass
    
    print(f"   Processing {len(entries_to_process)} recent articles across all topics...")

    # 3. Parallel Processing
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_to_entry = {
            executor.submit(process_entry_workflow, entry, known_links, topic_name, page_id): (entry, topic_name) 
            for entry, topic_name, page_id in entries_to_process
        }
        
        for future in concurrent.futures.as_completed(future_to_entry):
            try:
                result = future.result()
                if result:
                    results.append(result)
            except Exception as e:
                print(f"   ❌ Thread Error: {e}")

    # 4. Collect New Articles
    print(f"\n📦 Collected {len(results)} new articles...")
    
    results.sort(key=lambda x: x['article_dt'])

    new_articles = []
    for res in results:
        entry = res['entry']
        analysis = res['analysis']
        final_url = res['final_url']
        article_dt = res['article_dt']
        page_id = res['page_id']
        
        print(f"   ✅ NEW: {analysis['new_title']}")
        new_entry = {
            "date": article_dt.strftime("%Y-%m-%d"),
            "page_id": page_id,
            "title": analysis['new_title'],
            "summary": analysis['summary'],
            "priority": analysis.get('priority', 'Medium'),
            "type": "pending",
            "sources": [{
                "link": res['final_url'],
                "original_link": res['original_link'],
                "source": entry.source.title if hasattr(entry, 'source') and 'title' in entry.source else "News",
                "scraped_text": res['text']  # Store for deduplication
            }]
        }
        new_articles.append(new_entry)
    
    # 5. Post-Process Deduplication
    if new_articles:
        print(f"\n🔄 Deduplicating {len(new_articles)} articles...")
        # Note: deduplicate_articles now fetches from DB internally
        deduplicated = deduplicate_articles(new_articles)
        
        # Add deduplicated articles to DB
        print(f"   💾 Saving {len(deduplicated)} new articles to database...")
        for article in deduplicated:
            # Remove scraped_text before saving (handled by add_article but good to be clean)
            # Actually add_article handles 'scraped_text' being present in 'sources' and saves it to DB source table
            # and we probably WANT to save it now? schema has scraped_text.
            # So we pass the full article object.
            add_article(article)
        
        print(f"   ✨ {len(deduplicated)} unique articles added.")
    
    # 6. Save (Removed)
    # save_db(db)
    print("\n💤 Done.")

if __name__ == "__main__":
    main()
