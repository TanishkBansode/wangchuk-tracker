import json
import os
import libsql_experimental as libsql
from config import DATA_FILE

DB_FILE = "wangchuk.db"
SCHEMA_FILE = "src/db_schema.sql"

def migrate():
    print(f"🚀 Starting migration from {DATA_FILE} to {DB_FILE}...")
    
    # 1. Connect to DB (creates if not exists)
    conn = libsql.connect(DB_FILE)
    
    # 2. Apply Schema
    with open(SCHEMA_FILE, 'r') as f:
        schema_sql = f.read()
    conn.executescript(schema_sql)
    print("✅ Schema applied.")

    # 3. Load JSON Data
    if not os.path.exists(DATA_FILE):
        print(f"⚠️ {DATA_FILE} not found. access skipping data import.")
        return

    with open(DATA_FILE, 'r') as f:
        data = json.load(f)

    print(f"📦 Found {len(data)} articles to migrate.")

    # 4. Insert Data
    count = 0
    for item in data:
        # Map sentiment -> priority if priority is missing
        priority = item.get('priority')
        if not priority and 'sentiment' in item:
            priority = item['sentiment']
        
        # Insert Article
        # We need to execute and get last row id. 
        # libsql-experimental's execute returns a Cursor? No, it might not support cursor.lastrowid directly in older versions?
        # Let's use execute("INSERT ... RETURNING id") which is supported in SQLite 3.35+ (LibSQL supports it)
        
        try:
            # Note: Parameter substitution in libsql-experimental might be different.
            # It usually follows sqlite3 standard (?)
            # Using tuple for params.
            
            # Use a standard execute approach
            cur = conn.execute(
                """
                INSERT INTO articles (date, page_id, title, summary, priority, type)
                VALUES (?, ?, ?, ?, ?, ?)
                RETURNING id
                """,
                (
                    item.get('date'),
                    item.get('page_id', 'unknown'),
                    item.get('title'),
                    item.get('summary'),
                    priority,
                    item.get('type')
                )
            )
            
            row = cur.fetchone()
            cur.close() # Explicit close

            if row:
                article_id = row[0]
                
                # Insert Sources
                if 'sources' in item:
                    for source in item['sources']:
                        cur_source = conn.execute(
                            """
                            INSERT INTO sources (article_id, link, original_link, source, scraped_text)
                            VALUES (?, ?, ?, ?, ?)
                            """,
                            (
                                article_id,
                                source.get('link'),
                                source.get('original_link'),
                                source.get('source'),
                                source.get('scraped_text')
                            )
                        )
                        cur_source.close() # Explicit close


            count += 1
            if count % 100 == 0:
                print(f"   Processed {count} articles...")
                
        except Exception as e:
            print(f"❌ Error migrating item {item.get('title', 'Unknown')}: {e}")

    conn.commit()
    print(f"✨ Migration complete! {count} articles imported into {DB_FILE}.")

if __name__ == "__main__":
    migrate()
