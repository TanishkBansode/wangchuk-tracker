import requests
import feedparser
import trafilatura
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse

from googlenewsdecoder import new_decoderv1

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

def get_rss_url(query):
    return f"https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"

def main():
    # Define a test topic
    topic_query = "Sonam+Wangchuk"
    print(f"🔍 Fetching RSS feed for query: {topic_query}")
    
    rss_url = get_rss_url(topic_query)
    feed = feedparser.parse(rss_url)
    
    if not feed.entries:
        print("❌ No articles found.")
        return

    # Pick the first article
    entry = feed.entries[0]
    print(f"\n📑 Found Article: {entry.title}")
    print(f"🔗 Original Link: {entry.link}")

    # Resolve URL
    print("⏳ Resolving URL...")
    final_url = resolve_url(entry.link)
    print(f"📍 Final URL: {final_url}")

    # Extract Text
    print("⬇️  Downloading and Extracting text...")
    downloaded = trafilatura.fetch_url(final_url)
    
    if downloaded:
        # Try bare extraction first (same as bot.py)
        extraction = trafilatura.bare_extraction(downloaded)
        
        text = None
        if extraction and extraction.get('text'):
            text = extraction['text']
            print("\n✅ Extraction Successful (bare_extraction)!")
            
            # Check for canonical URL like bot.py allows
            if extraction.get('url'):
                canonical = extraction['url']
                print(f"   Canonical URL found: {canonical}")
                if 'google.com' not in canonical and len(canonical) > 10 and canonical != final_url:
                    print(f"   🔄 Re-fetching from canonical URL: {canonical}")
                    downloaded_canonical = trafilatura.fetch_url(canonical)
                    if downloaded_canonical:
                         extraction_canonical = trafilatura.bare_extraction(downloaded_canonical)
                         if extraction_canonical and extraction_canonical.get('text'):
                             text = extraction_canonical['text']
                             final_url = canonical
                             print("   ✅ Re-fetch successful!")

        else:
            print("⚠️  bare_extraction failed, trying fallback...")
            text = trafilatura.extract(downloaded)
        
        if text:
            print("\n" + "="*40)
            print(f"EXTRACTED TEXT CONTENT FROM: {final_url}")
            print("="*40)
            print(text)
            print("="*40)
            print(f"Total characters: {len(text)}")
        else:
            print("❌ Failed to extract meaningful text from this article.")
    else:
        print("❌ Failed to download page content.")

if __name__ == "__main__":
    main()
