import requests
import feedparser
import json
import os
import trafilatura

from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

# 1. Load Environment Variables (Local dev only)
load_dotenv()

# 2. Configure AI
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("❌ Error: GEMINI_API_KEY not found in .env file")
    exit()


from google import genai
from google.genai import types

client = genai.Client(api_key=API_KEY)
MODEL_ID = 'models/gemini-flash-lite-latest'

DATA_FILE = 'data.json'
# Google News RSS for Sonam Wangchuk
RSS_URL = "https://news.google.com/rss/search?q=Sonam+Wangchuk&hl=en-IN&gl=IN&ceid=IN:en"

def resolve_url(url):
    """Follows redirects to get the final article URL."""
    try:
        response = requests.head(url, allow_redirects=True, timeout=5)
        # If HEAD fails or doesn't redirect properly, try GET
        if response.status_code != 200 or 'google.com' in response.url:
             response = requests.get(url, allow_redirects=True, timeout=10)
        return response.url
    except Exception as e:
        print(f"   ⚠️  Redirect Error: {e}")
        return url

import concurrent.futures

# ... (Imports and Setup remain the same)

def analyze_article(text, original_title):
    # print(f"   🧠 Asking Gemini to analyze...") # Moved to inside function for cleaner logs
    prompt = f"""
    Analyze this article about Sonam Wangchuk. Return strictly JSON.
    Article Title: {original_title}
    Article Text: {text[:6000]}

    Tasks:
    1. is_relevant: Boolean. Is it about Sonam Wangchuk?
    2. is_clickbait: Boolean. Is the title misleading?
    3. sentiment: "Positive", "Neutral", "Critical", "Urgent", or "Negative".
    4. new_title: Write a factual, boring headline.
    5. summary: 2 short sentences. IMPORTANT: Include specific dates or times mentioned in the text (e.g., "on Monday", "Dec 5th") if available.

    Output Schema:
    {{
        "is_relevant": true,
        "is_clickbait": false,
        "sentiment": "Neutral",
        "new_title": "...",
        "summary": "..."
    }}
    """
    
    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_text)
    except Exception as e:
        print(f"   ❌ AI Error: {e}")
        return None

def process_entry(entry, known_links):
    """Handles the network/AI heavy lifting for a single entry."""
    
    # 1. Check if known (Fast check)
    if entry.link in known_links:
        print(f"⏭️  Skipping known link: {entry.title[:30]}...")
        return None

    print(f"\n🔎 Processing: {entry.title}")
    
    # 2. Resolve Redirect (Network)
    final_url = resolve_url(entry.link)
    if final_url in known_links:
         print(f"   ⏭️  Resolved link is known. Skipping.")
         return None

    # 3. Scrape (Network)
    downloaded = trafilatura.fetch_url(final_url)
    text = trafilatura.extract(downloaded)
    
    if not text:
        print("   ⚠️  Failed to extract text.")
        return None

    # 4. Analyze (AI)
    analysis = analyze_article(text, entry.title)
    
    if not analysis or not analysis['is_relevant']:
        return None
        
    return {
        "entry": entry,
        "final_url": final_url,
        "text": text,
        "analysis": analysis,
        "article_dt": datetime(*entry.published_parsed[:6]) if hasattr(entry, 'published_parsed') else datetime.now()
    }

def main():
    print("🤖 Bot waking up...")
    
    # 1. Read existing DB
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            db = json.load(f)
            print(f"📂 Loaded {len(db)} existing records.")
    else:
        db = []

    # Collect all known links
    known_links = set()
    for item in db:
        if 'sources' in item:
            for source in item['sources']:
                known_links.add(source['link'])
        elif 'link' in item:
             known_links.add(item['link'])

    # 2. Fetch RSS
    print(f"ww Fetching RSS feed from Google...")
    feed = feedparser.parse(RSS_URL)
    print(f"   Found {len(feed.entries)} articles.")

    # 3. Filter Entries by Date
    today_utc = datetime.now(timezone.utc).date()
    cutoff_date = today_utc - timedelta(days=7)
    print(f"📅 Filtering for articles published after: {cutoff_date}")
    
    entries_to_process = []
    for entry in feed.entries:
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            article_dt = datetime(*entry.published_parsed[:6])
            if article_dt.date() >= cutoff_date:
                entries_to_process.append(entry)
            else:
                # print(f"   ⏭️  Skipping old article: {entry.title[:30]}... ({article_dt.date()})")
                pass
    
    print(f"   Processing {len(entries_to_process)} recent articles...")

    # 4. Parallel Processing
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        # Submit all tasks
        future_to_entry = {executor.submit(process_entry, entry, known_links): entry for entry in entries_to_process}
        
        for future in concurrent.futures.as_completed(future_to_entry):
            try:
                result = future.result()
                if result:
                    results.append(result)
            except Exception as e:
                print(f"   ❌ Thread Error: {e}")

    # 5. Collect New Articles
    print(f"\n📦 Collected {len(results)} new articles...")
    
    # Sort results by date (oldest first)
    results.sort(key=lambda x: x['article_dt'])

    # Convert to article entries
    new_articles = []
    for res in results:
        entry = res['entry']
        analysis = res['analysis']
        final_url = res['final_url']
        article_dt = res['article_dt']
        
        print(f"   ✅ NEW: {analysis['new_title']}")
        new_entry = {
            "date": article_dt.strftime("%Y-%m-%d"),
            "title": analysis['new_title'],
            "summary": analysis['summary'],
            "sentiment": analysis['sentiment'],
            "type": "pending",
            "sources": [{
                "link": final_url,
                "source": entry.source.title if 'source' in entry else "News",
                "scraped_text": res['text']  # Store for deduplication
            }]
        }
        new_articles.append(new_entry)
    
    # 6. Post-Process Deduplication
    if new_articles:
        print(f"\n🔄 Deduplicating {len(new_articles)} articles...")
        deduplicated = deduplicate_articles(new_articles, db)
        
        # Add deduplicated articles to DB
        for article in deduplicated:
            # Remove scraped_text before saving
            for source in article['sources']:
                source.pop('scraped_text', None)
            db.insert(0, article)
        
        print(f"   ✨ {len(deduplicated)} unique articles after deduplication")
    
    # 7. Save
    with open(DATA_FILE, 'w') as f:
        json.dump(db, f, indent=2)
    print(f"   💾 Saved to {DATA_FILE}")

    print("\n💤 Done.")

def deduplicate_articles(new_articles, existing_db):
    """Post-process deduplication using gemini-flash-latest for better accuracy."""
    
    # Group by date
    from collections import defaultdict
    by_date = defaultdict(list)
    for article in new_articles:
        by_date[article['date']].append(article)
    
    # Also group existing DB by date
    existing_by_date = defaultdict(list)
    for article in existing_db:
        existing_by_date[article['date']].append(article)
    
    deduplicated = []
    DEDUPE_MODEL = 'models/gemini-flash-latest'
    
    for date, articles in by_date.items():
        print(f"   📅 Processing {date}: {len(articles)} new articles...")
        
        # Get existing articles from this date
        existing_articles = existing_by_date[date]
        
        # Track which articles have been merged
        merged_indices = set()
        
        for i, article in enumerate(articles):
            if i in merged_indices:
                continue
            
            # Check against existing DB articles
            match_found = False
            for existing in existing_articles:
                if is_duplicate(article, existing, DEDUPE_MODEL):
                    print(f"      🔗 Merging '{article['title'][:40]}...' → existing")
                    merge_into(existing, article)
                    match_found = True
                    break
            
            if match_found:
                merged_indices.add(i)
                continue
            
            # Check against other new articles
            for j in range(i + 1, len(articles)):
                if j in merged_indices:
                    continue
                
                if is_duplicate(article, articles[j], DEDUPE_MODEL):
                    print(f"      🔗 Merging '{articles[j]['title'][:40]}...' → '{article['title'][:40]}...'")
                    merge_into(article, articles[j])
                    merged_indices.add(j)
            
            deduplicated.append(article)
    
    return deduplicated

def is_duplicate(article1, article2, model):
    """Check if two articles are about the same event using Gemini."""
    
    prompt = f"""Are these two news articles about the SAME EVENT?

Article 1: "{article1['title']}"
Summary: {article1['summary']}

Article 2: "{article2['title']}"
Summary: {article2['summary']}

Rules:
- "Fact Check: Dead" and "Wife confirms safe" = SAME (both about death hoax)
- "Court hearing" and "Hearing adjourned" = SAME
- Different dates/different topics = DIFFERENT

Output JSON: {{"is_duplicate": true}} or {{"is_duplicate": false}}"""
    
    try:
        response = client.models.generate_content(
            model=model,
            contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        result = json.loads(response.text.replace('```json', '').replace('```', '').strip())
        return result.get('is_duplicate', False)
    except Exception as e:
        print(f"      ⚠️  Duplication check failed: {e}")
        return False

def merge_into(target, source):
    """Merge source article into target, preserving all information."""
    
    # Get scraped texts for smart summary merge
    target_text = target['sources'][0].get('scraped_text', '')
    source_text = source['sources'][0].get('scraped_text', '')
    
    # Merge summaries intelligently
    if target_text and source_text:
        merged_summary = merge_summaries_smart(target['summary'], source['summary'], target_text, source_text)
        target['summary'] = merged_summary
    
    # Append all sources
    target['sources'].extend(source['sources'])
    
    # Update sentiment to most severe
    severity = {"Positive": 1, "Neutral": 2, "Critical": 3, "Urgent": 4, "Negative": 5}
    if severity.get(source['sentiment'], 0) > severity.get(target['sentiment'], 0):
        target['sentiment'] = source['sentiment']

def merge_summaries_smart(summary1, summary2, text1, text2):
    """Use Gemini to merge two summaries, preserving unique details."""
    
    prompt = f"""Merge these two summaries about the same event. Include unique details from both.

Summary 1: {summary1}
Summary 2: {summary2}

Article 1 text: {text1[:1000]}
Article 2 text: {text2[:1000]}

Create a merged summary (2-3 sentences) that:
- Includes unique facts from both
- Mentions dates/times if present
- Removes redundancy

Output JSON: {{"merged_summary": "..."}}"""
    
    try:
        response = client.models.generate_content(
            model='models/gemini-flash-latest',
            contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        result = json.loads(response.text.replace('```json', '').replace('```', '').strip())
        return result.get('merged_summary', summary1)
    except Exception as e:
        print(f"      ⚠️  Summary merge failed: {e}")
        return summary1

if __name__ == "__main__":
    main()

