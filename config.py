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

MODEL_ID = 'gemini-2.5-flash-lite'
EMBEDDING_MODEL = 'models/gemini-embedding-2-preview'
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
    {
        "page_id": "iran_israel_war",
        "page_title": "Iran-Israel-America War",
        "topic_name": "Iran Israel America War",
        "query": "Iran+Israel+America+war"
    },
    {
        "page_id": "lpg_shortage_india",
        "page_title": "LPG Shortage Crisis India",
        "topic_name": "LPG Shortage India",
        "query": "LPG+shortage+crisis+India"
    },
]
