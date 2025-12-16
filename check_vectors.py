import json

with open('worker/src/topics_vectors.json', 'r') as f:
    data = json.load(f)

print(f"Topics count: {len(data.get('topics', []))}")
print(f"Embeddings count: {len(data.get('embeddings', []))}")

topics = data.get('topics', [])
for i, topic in enumerate(topics):
    print(f"{i}: {topic['topic_name']} ({topic['page_id']})")
