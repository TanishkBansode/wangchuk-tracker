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
	"topic_name": "Red Fort Incident",
	"query": "Red+Fort+Blast+Incident"
    },
    {
	"page_id": "pmpml_buses",
	"page_title": "PMPML Buses",
	"topic_name": "PMPML Buses",
	"query": "PMPML+buses"
    },
    {
	"page_id": "bulgaria_incident",
	"page_title": "Bulgaria incident",
	"topic_name": "Bulgaria Incident",
	"query": "Bulgaria+Incident"
    },
    {
	"page_id": "bulgaria_incident",
	"page_title": "Bulgaria incident",
	"topic_name": "Bulgaria protest",
	"query": "Bulgaria+Protest"
    },
    {
	"page_id": "sydney_mass_shooting",
	"page_title": "Sydney mass shooting",
	"topic_name": "Sydney mass shooting",
	"query": "Sydney+mass+shooting"
    },
]
