import requests
import feedparser
import json
import os
import trafilatura
import time
import numpy as np
import threading

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
MODEL_ID = 'gemma-3-27b-it'
EMBEDDING_MODEL = 'models/text-embedding-004'
SIMILARITY_THRESHOLD = 0.80  # Tunable: 0.80-0.95 for duplicate detection

DATA_FILE = 'data.json'

# ============ RATE LIMITING ============
# Free tier limits:
#   - Flash Lite: 10 RPM
#   - Flash: 5 RPM  
#   - Embedding: 5M tokens/min (effectively unlimited for our use)

class RateLimiter:
    """Thread-safe rate limiter that ensures we don't exceed RPM limits."""
    
    def __init__(self, requests_per_minute: int, name: str = "API"):
        self.rpm = requests_per_minute
        self.name = name
        self.min_interval = 60.0 / requests_per_minute  # seconds between requests
        self.last_request_time = 0.0
        self.lock = threading.Lock()
    
    def wait(self):
        """Wait if necessary to stay within rate limit."""
        with self.lock:
            now = time.time()
            elapsed = now - self.last_request_time
            
            if elapsed < self.min_interval:
                wait_time = self.min_interval - elapsed
                print(f"      ⏱️  Rate limiting ({self.name}): waiting {wait_time:.1f}s")
                time.sleep(wait_time)
            
            self.last_request_time = time.time()

# Create rate limiters for each model type
RATE_LIMITER_FLASH_LITE = RateLimiter(requests_per_minute=8, name="Flash-Lite")  # 10 RPM limit, use 8 for safety
RATE_LIMITER_FLASH = RateLimiter(requests_per_minute=4, name="Flash")  # 5 RPM limit, use 4 for safety
RATE_LIMITER_GEMMA = RateLimiter(requests_per_minute=25, name="Gemma")  # 30 RPM limit, use 25 for safety
RATE_LIMITER_EMBEDDING = RateLimiter(requests_per_minute=1000, name="Embedding")  # Token-based, 5M tokens/min - very generous

TOPICS = [
    {
        "page_id": "wangchuk",
        "page_title": "Sonam Wangchuk",
        "topic_name": "Sonam Wangchuk",
        "query": "Sonam+Wangchuk"
    },
    {
        "page_id": "pune_pollution",
        "page_title": "Pune Air Pollution",
        "topic_name": "Pune Air Pollution",
        "query": "Pune+air+pollution"
    },
    {
        "page_id": "pune_pollution",
        "page_title": "Pune Air Pollution",
        "topic_name": "Pimpri Chinchwad Air Pollution",
        "query": "Pimpri+Chinchwad+air+pollution"
    },
    {
        "page_id": "pune_metro",
        "page_title": "Pune Metro",
        "topic_name": "Pune Metro",
        "query": "Pune+metro"
    },
    {
        "page_id": "trees_nashik",
        "page_title": "Nashik trees",
        "topic_name": "Nashik trees",
        "query": "Nashik+trees"
    },
    {
	"page_id": "formula_1",
	"page_title": "Formula 1",
	"topic_name": "Formula 1",
	"query": "Formula+1"
    },
    {
	"page_id": "red_fort_incident",
	"page_title": "red_fort_incident",
	"topic_name": "red_fort_incident",
	"query": "Red+Fort+Blast+Incident"
}
]

def get_rss_url(query):
    return f"https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"

def get_embeddings(texts: list) -> list:
    """Generate embeddings for a batch of texts using Gemini embedding model.
    
    Uses the embedding model which has much higher rate limits (5M tokens/min)
    compared to generative models (5-10 RPM).
    """
    embeddings = []
    
    # Truncate texts to stay within token limits (~2048 tokens max per text)
    truncated_texts = [text[:3000] for text in texts]  # ~750 tokens each
    
    for text in truncated_texts:
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Use rate limiter (embedding has generous limits but still good practice)
                RATE_LIMITER_EMBEDDING.wait()
                
                response = client.models.embed_content(
                    model=EMBEDDING_MODEL,
                    contents=text
                )
                embeddings.append(response.embeddings[0].values)
                # Progress logging every 10 articles
                idx = len(embeddings)
                if idx % 10 == 0 or idx == len(truncated_texts):
                    print(f"         🔹 Embedded {idx}/{len(truncated_texts)} articles...", flush=True)
                break  # Success, exit retry loop
            except Exception as e:
                error_str = str(e)
                if "429" in error_str and attempt < max_retries - 1:
                    wait_time = 10 * (attempt + 1)
                    print(f"      ⏳ Embedding rate limit. Waiting {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    print(f"      ⚠️ Embedding error: {e}")
                    # Return zero vector as fallback
                    embeddings.append([0.0] * 768)
                    break
    
    return embeddings

def cosine_similarity(vec1: list, vec2: list) -> float:
    """Calculate cosine similarity between two vectors.
    
    Returns a value between -1 and 1, where 1 means identical.
    """
    a = np.array(vec1)
    b = np.array(vec2)
    
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
    
    return float(np.dot(a, b) / (norm_a * norm_b))

# Global session for connection pooling and cookie persistence
session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://news.google.com/'
})

def resolve_url(url):
    """Follows redirects to get the final article URL."""
    try:
        # 1. Try HEAD first
        response = session.head(url, allow_redirects=True, timeout=10)
        
        # 2. If HEAD fails or gives generic google link, try GET
        if response.status_code != 200 or 'google.com' in response.url:
             response = session.get(url, allow_redirects=True, timeout=15)
        
        final = response.url
        
        # 3. Basic cleaning: remove common tracking params
        if '?' in final:
            from urllib.parse import urlparse, urlencode, parse_qs, urlunparse
            u = urlparse(final)
            query = parse_qs(u.query)
            clean_query = {k: v for k, v in query.items() if not any(x in k for x in ['utm_', 'ref', 'source_id'])}
            u = u._replace(query=urlencode(clean_query, doseq=True))
            final = urlunparse(u)
            
        return final
    except Exception as e:
        print(f"   ⚠️  Redirect Error: {e} | URL: {url[:50]}...")
        return url

import concurrent.futures
import re

# ... (Imports and Setup remain the same)

def call_with_retry(model, prompt, max_retries=5):
    """Calls Gemini API with robust rate limit handling."""
    
    # Select appropriate rate limiter based on model
    if 'flash-lite' in model.lower():
        rate_limiter = RATE_LIMITER_FLASH_LITE
    elif 'flash' in model.lower():
        rate_limiter = RATE_LIMITER_FLASH
    elif 'gemma' in model.lower():
        rate_limiter = RATE_LIMITER_GEMMA
    else:
        rate_limiter = RATE_LIMITER_FLASH  # Default to most restrictive
    
    for attempt in range(max_retries):
        try:
            # Wait for rate limit before making request
            rate_limiter.wait()
            
            # Gemma models don't support JSON mode config via API yet
            generation_config = types.GenerateContentConfig(response_mime_type="application/json")
            if 'gemma' in model.lower():
                generation_config = None
            
            response = client.models.generate_content(
                model=model,
                contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])],
                config=generation_config
            )
            return response
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "503" in error_str:
                wait_time = 15 * (attempt + 1)  # Default backoff (increased)
                
                # Try to parse exact wait time from error message
                match = re.search(r"Please retry in ([\d\.]+)s", error_str)
                if match:
                    wait_time = float(match.group(1)) + 5.0  # Add larger buffer
                
                print(f"      ⏳ Rate limit hit. Waiting {wait_time:.1f}s... (Attempt {attempt+1}/{max_retries})")
                time.sleep(wait_time)
            else:
                print(f"   ❌ AI Error: {e}")
                return None
    return None

def analyze_article(text, original_title, topic_name):
    # print(f"   🧠 Asking Gemini to analyze...") # Moved to inside function for cleaner logs
    prompt = f"""
    Analyze this article about {topic_name}. Return strictly JSON.
    Article Title: {original_title}
    Article Text: {text[:30000]}

    Tasks:
    1. is_relevant: Boolean. Is it about {topic_name}?
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
    
    response = call_with_retry(MODEL_ID, prompt)
    if response:
        try:
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_text)
        except:
            return None
    return None

def process_entry(entry, known_links, topic_name, page_id):
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
    
    # Use bare_extraction to get metadata (canonical URL) + text
    extraction = trafilatura.bare_extraction(downloaded)
    
    if not extraction or not extraction.get('text'):
        print("   ⚠️  Failed to extract text.")
        try:
             # Fallback to simple extraction if bare fails
             text = trafilatura.extract(downloaded)
             if not text: return None
        except:
             return None
    else:
        text = extraction['text']
        # If the page has a canonical URL, prefer it over the redirect/google one
        if extraction.get('url'):
            canonical = extraction['url']
            if 'google.com' not in canonical and len(canonical) > 10:
                final_url = canonical

    # 4. Analyze (AI)
    analysis = analyze_article(text, entry.title, topic_name)
    
    if not analysis or not analysis['is_relevant']:
        return None
        
    return {
        "entry": entry,
        "original_link": entry.link,
        "final_url": final_url,
        "text": text,
        "analysis": analysis,
        "page_id": page_id,
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

    # Migration: Add default page_id to existing records
    for item in db:
        if 'page_id' not in item:
            # Heuristic: If it mentions "Pune", it's pollution, else Wangchuk
            if "Pune" in item.get('title', '') or "Pollution" in item.get('title', ''):
                item['page_id'] = 'pune_pollution'
            else:
                item['page_id'] = 'wangchuk'

    # Collect all known links (both final and original)
    known_links = set()
    for item in db:
        if 'sources' in item:
            for source in item['sources']:
                known_links.add(source['link'])
                if 'original_link' in source:
                     known_links.add(source['original_link'])
        elif 'link' in item:
             known_links.add(item['link'])

    # 2. Fetch RSS for all topics
    entries_to_process = []
    
    today_utc = datetime.now(timezone.utc).date()
    cutoff_date = today_utc - timedelta(days=7)
    print(f"📅 Filtering for articles published after: {cutoff_date}")

    for topic in TOPICS:
        print(f"\nww Fetching RSS feed for: {topic['topic_name']} ({topic['page_id']})...")
        rss_url = get_rss_url(topic['query'])
        feed = feedparser.parse(rss_url)
        print(f"   Found {len(feed.entries)} articles.")

        for entry in feed.entries:
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                article_dt = datetime(*entry.published_parsed[:6])
                if article_dt.date() >= cutoff_date:
                    # Attach topic and page_id to entry for processing
                    entries_to_process.append((entry, topic['topic_name'], topic['page_id']))
                else:
                    pass
    
    print(f"   Processing {len(entries_to_process)} recent articles across all topics...")

    # 4. Parallel Processing (restored to 5 workers due to higher Gemma limits)
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        # Submit all tasks
        future_to_entry = {
            executor.submit(process_entry, entry, known_links, topic_name, page_id): (entry, topic_name) 
            for entry, topic_name, page_id in entries_to_process
        }
        
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
        page_id = res['page_id']
        
        print(f"   ✅ NEW: {analysis['new_title']}")
        new_entry = {
            "date": article_dt.strftime("%Y-%m-%d"),
            "page_id": page_id,
            "title": analysis['new_title'],
            "summary": analysis['summary'],
            "sentiment": analysis['sentiment'],
            "type": "pending",
            "sources": [{
                "link": res['final_url'],
                "original_link": res['original_link'],
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
    """Post-process deduplication using embeddings for efficiency.
    
    Uses Gemini embedding model (5M tokens/min limit) instead of
    generative model (5-10 RPM limit) for massive rate limit savings.
    """
    
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
    
    for date, articles in by_date.items():
        print(f"   📅 Processing {date}: {len(articles)} new articles...")
        
        # Get existing articles from this date
        existing_articles = existing_by_date[date]
        all_articles = articles + existing_articles
        
        if len(all_articles) == 0:
            continue
        
        # ⭐ BATCH EMBED ALL ARTICLES AT ONCE (1 API call per article, but embedding model has huge limits)
        print(f"      🔢 Generating embeddings for {len(all_articles)} articles...")
        texts = [f"{a['title']} {a['summary']}" for a in all_articles]
        embeddings = get_embeddings(texts)
        
        # Build embeddings cache keyed by title
        embeddings_cache = {}
        for i, article in enumerate(all_articles):
            embeddings_cache[article['title']] = embeddings[i]
        
        # Track which articles have been merged
        merged_indices = set()
        
        for i, article in enumerate(articles):
            if i in merged_indices:
                continue
            
            # Check against existing DB articles
            match_found = False
            for existing in existing_articles:
                if is_duplicate_embedding(article, existing, embeddings_cache):
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
                
                if is_duplicate_embedding(article, articles[j], embeddings_cache):
                    print(f"      🔗 Merging '{articles[j]['title'][:40]}...' → '{article['title'][:40]}...'")
                    merge_into(article, articles[j])
                    merged_indices.add(j)
            
            deduplicated.append(article)
    
    return deduplicated

def is_duplicate_embedding(article1, article2, embeddings_cache: dict) -> bool:
    """Check if two articles are duplicates using pre-computed embeddings.
    
    Uses cosine similarity instead of LLM calls - zero API cost after embeddings are generated.
    """
    key1 = article1['title']
    key2 = article2['title']
    
    if key1 not in embeddings_cache or key2 not in embeddings_cache:
        return False
    
    similarity = cosine_similarity(embeddings_cache[key1], embeddings_cache[key2])
    
    # Debug logging for similarity scores
    if similarity > 0.7:  # Log potentially similar articles
        print(f"         📊 Similarity: {similarity:.3f} between '{key1[:30]}...' and '{key2[:30]}...'")
    
    return similarity >= SIMILARITY_THRESHOLD


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

Article 1 text: {text1[:10000]}
Article 2 text: {text2[:10000]}

Create a merged summary (2-3 sentences) that:
- Includes unique facts from both
- Mentions dates/times if present
- Removes redundancy

Output JSON: {{"merged_summary": "..."}}"""
    
    response = call_with_retry(MODEL_ID, prompt)
    if response:
        try:
            result = json.loads(response.text.replace('```json', '').replace('```', '').strip())
            return result.get('merged_summary', summary1)
        except:
            return summary1
    return summary1

if __name__ == "__main__":
    main()

