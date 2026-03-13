from src.database import get_connection

def cleanup():
    conn = get_connection()
    print("Checking topics before cleanup...")
    cur = conn.execute("SELECT page_id, COUNT(*) FROM articles GROUP BY page_id")
    rows = cur.fetchall()
    for row in rows:
        print(f" - {row[0]}: {row[1]} articles")

    print("\n🗑️ Deleting non-Wangchuk topics...")
    
    # 1. Delete sources for these articles (in case no Cascade)
    conn.execute("""
        DELETE FROM sources 
        WHERE article_id IN (
            SELECT id FROM articles WHERE page_id != 'wangchuk'
        )
    """)
    
    # 2. Delete the articles
    cur = conn.execute("DELETE FROM articles WHERE page_id != 'wangchuk'")
    deleted_count = cur.rowcount
    
    conn.commit()
    print(f"✅ Deleted {deleted_count} articles.")

    print("\nChecking topics after cleanup...")
    cur = conn.execute("SELECT page_id, COUNT(*) FROM articles GROUP BY page_id")
    rows = cur.fetchall()
    for row in rows:
        print(f" - {row[0]}: {row[1]} articles")

if __name__ == "__main__":
    cleanup()
