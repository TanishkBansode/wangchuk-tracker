import json

file_path = 'worker/src/topics_vectors.json'

with open(file_path, 'r') as f:
    data = json.load(f)

topics = data.get('topics', [])
embeddings = data.get('embeddings', [])

indices_to_remove = []
for i, topic in enumerate(topics):
    if topic['page_id'] in ['bulgaria_incident', 'sydney_mass_shooting']:
        indices_to_remove.append(i)

# Sort indices in descending order to remove from end first
indices_to_remove.sort(reverse=True)

print(f"Removing indices: {indices_to_remove}")

for i in indices_to_remove:
    print(f"Removing {topics[i]['topic_name']}")
    del topics[i]
    del embeddings[i]

data['topics'] = topics
data['embeddings'] = embeddings

with open(file_path, 'w') as f:
    json.dump(data, f, indent=2)

print("Updated worker/src/topics_vectors.json")
