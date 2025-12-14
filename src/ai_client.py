import os
import time
import threading
import re
from google import genai
from google.genai import types
from config import API_KEY, EMBEDDING_MODEL

# Configure AI Client
if not API_KEY:
    # This check is also in config.py, but safe to check before initializing client
    raise ValueError("GEMINI_API_KEY not found")

client = genai.Client(api_key=API_KEY)

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
