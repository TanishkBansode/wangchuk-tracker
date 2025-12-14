import os
import libsql_experimental as libsql
from config import DATA_FILE, TURSO_DB_URL, TURSO_DB_TOKEN

# Use local file for now, but configured to be easily switchable to Turso URL
DB_FILE = "wangchuk.db"

def get_connection():
    if TURSO_DB_URL and TURSO_DB_TOKEN:
        print("☁️ Connecting to Turso Cloud Database...")
        return libsql.connect(TURSO_DB_URL, auth_token=TURSO_DB_TOKEN)
    
    print("TB Connecting to local database...")
    return libsql.connect(DB_FILE)

def get_known_links():
    """Fetch all known links from the database to avoid re-fetching."""
    conn = get_connection()
    try:
        # Fetch from sources table
        cur = conn.execute("SELECT link, original_link FROM sources")
        rows = cur.fetchall()
        
        links = set()
        for row in rows:
            if row[0]: # link
                links.add(row[0])
            if row[1]: # original_link
                links.add(row[1])
        return links
    finally:
        # conn.close() # LibSQL might not need explicit close on connection if it's local file, but good practice?
        # wrapper doesn't seem to have close() on connect object in some versions, but let's assume valid.
        pass

def get_articles_by_date(date_str=None, page_id=None, limit=100):
    """Fetch articles. Can filter by date or page_id."""
    conn = get_connection()
    
    query = "SELECT id, date, page_id, title, summary, priority, type FROM articles"
    params = []
    conditions = []
    
    if date_str:
        conditions.append("date = ?")
        params.append(date_str)
    
    if page_id:
        conditions.append("page_id = ?")
        params.append(page_id)
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
        
    query += " ORDER BY date DESC LIMIT ?"
    params.append(limit)
    
    cur = conn.execute(query, tuple(params))
    articles = []
    
    rows = cur.fetchall()
    
    for row in rows:
        article_id = row[0]
        article = {
            "id": article_id,
            "date": row[1],
            "page_id": row[2],
            "title": row[3],
            "summary": row[4],
            "priority": row[5],
            "type": row[6],
            "sources": []
        }
        
    # Optimized way: fetch all sources for these article IDs in one go.
        # But re-using helper for now
        articles.append(_fetch_full_article(conn, row))
        
    return articles

def add_article(article):
    """Insert a new article and its sources into the database."""
    conn = get_connection()
    
    try:
        cur = conn.execute(
            """
            INSERT INTO articles (date, page_id, title, summary, priority, type)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING id
            """,
            (
                article.get('date'),
                article.get('page_id', 'unknown'),
                article.get('title'),
                article.get('summary'),
                article.get('priority', 'Medium'),
                article.get('type', 'pending')
            )
        )
        row = cur.fetchone()
        cur.close()
        
        if row:
            article_id = row[0]
            if 'sources' in article:
                for source in article['sources']:
                    conn.execute(
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
        conn.commit()
        return True
    except Exception as e:
        print(f"❌ Error adding article: {e}")
        return False

def get_topics_summary():
    """Get a summary of topics with article counts and latest update."""
    conn = get_connection()
    cur = conn.execute("""
        SELECT 
            page_id, 
            COUNT(*) as count, 
            MAX(date) as latest_date 
        FROM articles 
        GROUP BY page_id
        ORDER BY latest_date DESC
    """)
    rows = cur.fetchall()
    topics = []
    for row in rows:
        topics.append({
            "page_id": row[0],
            "count": row[1],
            "latest_date": row[2]
        })
    return topics

def search_articles(query):
    """Search articles by title or summary."""
    conn = get_connection()
    # Using simple LIKE for now. 
    # For better performance, FTS (Full Text Search) module in SQLite would be ideal, 
    # but requires table setup with FTS. Keeping it simple compatible with current schema.
    wildcard_query = f"%{query}%"
    cur = conn.execute(
        """
        SELECT id, date, page_id, title, summary, priority, type 
        FROM articles 
        WHERE title LIKE ? OR summary LIKE ?
        ORDER BY date DESC
        LIMIT 50
        """,
        (wildcard_query, wildcard_query)
    )
    articles = []
    rows = cur.fetchall()
    for row in rows:
        # We need to fetch sources or just minimal info?
        # Search results typically need title/link/summary.
        # Fetch sources efficiently? simple loop for now.
        articles.append(_fetch_full_article(conn, row))
    return articles

def _fetch_full_article(conn, row):
    """Helper to hydrate article object from row."""
    article_id = row[0]
    article = {
        "id": article_id,
        "date": row[1],
        "page_id": row[2],
        "title": row[3],
        "summary": row[4],
        "priority": row[5],
        "type": row[6],
        "sources": []
    }
    
    cur_sources = conn.execute(
        "SELECT link, original_link, source, scraped_text FROM sources WHERE article_id = ?",
        (article_id,)
    )
    s_rows = cur_sources.fetchall()
    for s_row in s_rows:
        article["sources"].append({
            "link": s_row[0],
            "original_link": s_row[1],
            "source": s_row[2],
            "scraped_text": s_row[3]
        })
    return article

