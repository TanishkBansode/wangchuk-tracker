from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from src.database import get_articles_by_date, get_topics_summary
from src.search_engine import search_engine
import os

app = FastAPI(title="Wangchuk Tracker API")

@app.on_event("startup")
async def startup_event():
    try:
        await search_engine.initialize()
    except Exception as e:
        print(f"⚠️  Search engine init failed (non-fatal): {e}")

# Serve Index
@app.get("/")
async def read_index():
    return FileResponse('index.html')

# API Endpoints
@app.get("/api/topics")
async def get_topics():
    return get_topics_summary()

@app.get("/api/articles")
async def get_articles(
    topic: str = Query(None, alias="topic"),
    date: str = Query(None),
    limit: int = 100
):
    try:
        articles = get_articles_by_date(date_str=date, page_id=topic, limit=limit)
        return articles
    except Exception as e:
        import traceback
        print(f"❌ /api/articles error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search")
async def search(q: str, mode: str = "semantic"):
    if not q:
        return []
    
    if mode == "simple":
        return search_engine.simple_search(q)
    else:
        # Use Semantic Search Engine
        return search_engine.search(q)

# Static Files (CSS, JS)
# Ensure the directory exists
os.makedirs("static/css", exist_ok=True)
os.makedirs("static/js", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
