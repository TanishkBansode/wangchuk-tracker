import requests
import trafilatura
from googlenewsdecoder import new_decoderv1

# Global session for connection pooling and cookie persistence
session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://news.google.com/'
})

def get_rss_url(query):
    return f"https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"

def resolve_url(url):
    """Decodes Google News URL using googlenewsdecoder library."""
    try:
        # Use a small interval to be polite/avoid rate limits if doing many
        decoded = new_decoderv1(url, interval=0.5)
        if decoded.get('status'):
            return decoded['decoded_url']
        else:
            print(f"   ⚠️  Decoder failed: {decoded.get('message', 'Unknown error')}")
            return url
    except Exception as e:
        print(f"   ⚠️  Decoder Exception: {e}")
        return url

def fetch_article_content(entry, known_links):
    """
    Fetches article content.
    Returns a dict with 'final_url', 'text' if successful, None otherwise.
    Note: This does NOT do the AI analysis. It only gets the raw text.
    """
    
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
    try:
        downloaded = trafilatura.fetch_url(final_url)
    except Exception as e:
        print(f"   ⚠️  Fetch error for {final_url}: {e}")
        return None
        
    if not downloaded:
         print(f"   ⚠️  Empty response for {final_url}")
         return None

    # Use bare_extraction to get metadata (canonical URL) + text
    extraction = trafilatura.bare_extraction(downloaded)
    
    text = None
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

    return {
        "final_url": final_url,
        "text": text,
        "original_link": entry.link
    }
