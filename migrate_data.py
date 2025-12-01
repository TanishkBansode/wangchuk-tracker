import json
import os

DATA_FILE = 'data.json'

if os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'r') as f:
        data = json.load(f)

    new_data = []
    for item in data:
        # Check if already migrated
        if 'sources' in item:
            new_data.append(item)
            continue

        # Create new structure
        new_item = {
            "date": item.get("date"),
            "title": item.get("title"),
            "summary": item.get("summary"),
            "sentiment": item.get("sentiment"),
            "type": item.get("type"),
            "sources": [
                {
                    "link": item.get("link"),
                    "source": item.get("source")
                }
            ]
        }
        new_data.append(new_item)

    with open(DATA_FILE, 'w') as f:
        json.dump(new_data, f, indent=2)
    
    print(f"✅ Migrated {len(new_data)} records to new schema.")
else:
    print("No data file found.")
