
import sys
import os
import json
import numpy as np

# Add project root to path to import config and src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from config import TOPICS
from src.ai_client import get_embeddings

def main():
    print("🔍 Generating embeddings for topics...")
    
    # Prepare texts: "Title: Description"
    # Using the same logic as search_engine.py
    texts = [f"{t['topic_name']} {t['page_title']} {t['page_id'].replace('_', ' ')}" for t in TOPICS]
    
    try:
        embeddings = get_embeddings(texts)
        
        # Convert to list of lists (if numpy)
        embeddings_list = [e.tolist() if isinstance(e, np.ndarray) else e for e in embeddings]
        
        output_data = {
            "topics": TOPICS,
            "embeddings": embeddings_list
        }
        
        output_path = os.path.join(os.path.dirname(__file__), '../src/topics_vectors.json')
        with open(output_path, 'w') as f:
            json.dump(output_data, f, indent=2)
            
        print(f"✅ Saved embeddings for {len(TOPICS)} topics to {output_path}")
        
    except Exception as e:
        print(f"❌ Failed to generate embeddings: {e}")

if __name__ == "__main__":
    main()
