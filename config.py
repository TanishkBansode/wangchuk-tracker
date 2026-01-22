import os
from dotenv import load_dotenv

# Load Environment Variables
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("❌ Error: GEMINI_API_KEY not found in .env file")
    # We might want to handle this more gracefully or let main.py handle exit, 
    # but for now keeping logic similar to original.
    # actually, print is fine, but exit() at module level is bad practice.
    # leaving it for now to match behavior, but will let main check it.

MODEL_ID = 'gemma-3-27b-it'
EMBEDDING_MODEL = 'models/text-embedding-004'
SIMILARITY_THRESHOLD = 0.80  # Tunable: 0.80-0.95 for duplicate detection
DATA_FILE = 'data.json'

TURSO_DB_URL = os.getenv("TURSO_DB_URL")
TURSO_DB_TOKEN = os.getenv("TURSO_DB_TOKEN")

TOPICS = [
    {
        "page_id": "wangchuk",
        "page_title": "Sonam Wangchuk",
        "topic_name": "Sonam Wangchuk",
        "query": "Sonam+Wangchuk"
    },
]
