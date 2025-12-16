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
cur = conn.execute("SELECT DISTINCT page_id FROM articles")
rows = cur.fetchall()
print("Topics in DB:")
for row in rows:
    print(row[0])
