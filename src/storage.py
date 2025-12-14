from src.database import get_articles_by_date, add_article, get_known_links

# Legacy support / alias
def load_db():
    # Deprecated: usage in main.py needs to be refactored.
    # We return an empty list because the main logic will be changed to not iterate over this.
    return []

def save_db(db):
    # Deprecated: usage in main.py will be replaced by direct add_article calls
    pass

