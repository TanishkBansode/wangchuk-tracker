import os
import libsql_experimental as libsql
from dotenv import load_dotenv

load_dotenv()

TURSO_DB_URL = os.getenv("TURSO_DB_URL")
TURSO_DB_TOKEN = os.getenv("TURSO_DB_TOKEN")
DB_FILE = "wangchuk.db"

def get_connection():
    if TURSO_DB_URL and TURSO_DB_TOKEN:
        print("☁️ Connecting to Turso Cloud Database...")
        return libsql.connect(TURSO_DB_URL, auth_token=TURSO_DB_TOKEN)
    
    print("TB Connecting to local database...")
    return libsql.connect(DB_FILE)

conn = get_connection()
topics_to_remove = ['formula_1', 'bulgaria_incident', 'sydney_mass_shooting']

for topic in topics_to_remove:
    print(f"Deleting articles for topic: {topic}")
    cur = conn.execute("DELETE FROM articles WHERE page_id = ?", (topic,))
    print(f"Deleted {cur.rowcount} rows.")
    
conn.commit()
print("Done.")
