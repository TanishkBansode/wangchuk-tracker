import numpy as np
from config import TOPICS
from src.ai_client import get_embeddings

class SearchEngine:
    def __init__(self):
        self.topics = TOPICS
        self.topic_embeddings = []
        self.is_ready = False
        print("🔍 Initializing Search Engine...")

    async def initialize(self):
        """Generate embeddings for all topics."""
        print(f"   Generating embeddings for {len(self.topics)} topics...")
        
        # Prepare texts for embedding: "Title: Description" or just "Title"
        # We'll use topic_name and page_title to capture variations
        texts = [f"{t['topic_name']} {t['page_title']} {t['page_id'].replace('_', ' ')}" for t in self.topics]
        
        try:
            # get_embeddings is synchronous but we can call it here
            # Ideally this should be async or threaded if it takes long, 
            # but for 10 topics it's fast (1 batch call).
            embeddings = get_embeddings(texts)
            self.topic_embeddings = [np.array(e) for e in embeddings]
            self.is_ready = True
            print("   ✅ Search Engine Ready!")
        except Exception as e:
            print(f"   ❌ Search Engine Init Failed: {e}")

    def search(self, query: str, limit: int = 5):
        if not self.is_ready or not query:
            return []
        
        try:
            # Generate embedding for query
            query_embedding = get_embeddings([query])[0]
            query_vec = np.array(query_embedding)
            
            # Calculate Cosine Similarity
            results = []
            for i, topic_vec in enumerate(self.topic_embeddings):
                # Cosine Similarity: (A . B) / (||A|| * ||B||)
                norm_q = np.linalg.norm(query_vec)
                norm_t = np.linalg.norm(topic_vec)
                
                if norm_q == 0 or norm_t == 0:
                    score = 0
                else:
                    score = float(np.dot(query_vec, topic_vec) / (norm_q * norm_t))
                
                if score > 0.4: # Threshold
                    results.append({
                        "page_id": self.topics[i]["page_id"],
                        "title": self.topics[i]["topic_name"],
                        "score": score,
                        "summary": f"News about {self.topics[i]['topic_name']}"
                    })
            
            # Sort by score DESC
            results.sort(key=lambda x: x["score"], reverse=True)
            return results[:limit]
            
        except Exception as e:
            print(f"   ❌ Search Error: {e}")
            return []

    def simple_search(self, query: str, limit: int = 5):
        """Perform simple string matching for instant results."""
        if not query:
            return []
        
        query = query.lower()
        results = []
        for topic in self.topics:
            # Check topic name, page title, and page_id
            score = 0
            t_name = topic["topic_name"].lower()
            p_title = topic["page_title"].lower()
            
            if query == t_name or query == p_title:
                score = 1.0 # Exact match
            elif query in t_name or query in p_title:
                score = 0.8 # Substring match
            elif any(word in t_name for word in query.split()):
                score = 0.5 # Word match
                
            if score > 0:
                results.append({
                    "page_id": topic["page_id"],
                    "title": topic["topic_name"],
                    "score": score,
                    "summary": f"Topic: {topic['topic_name']}"
                })
        
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]


# Singleton instance
search_engine = SearchEngine()
