import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)
MODEL_ID = 'models/gemini-2.0-flash-exp'  # Using experimental model

def check_similarity(new_title, new_text, existing_events):
    print(f"   🤔 Checking '{new_title[:40]}...' against {len(existing_events)} events...")
    
    events_context = ""
    for i, event in enumerate(existing_events):
        events_context += f"ID {i}: {event['title']}\nSummary: {event['summary']}\n\n"

    prompt = f"""
    I have a new news article. Check if it covers the SAME TOPIC/EVENT as any of the existing stories below.
    
    New Article: "{new_title}"
    Text: "{new_text[:1000]}"
    
    Existing Stories:
    {events_context}
    
    Rules:
    - STRICTLY MERGE if they are about the same core event, even if the source or angle is different.
    - Example: "Fact Check: Wangchuk Dead" and "Wife says Wangchuk Safe" ARE THE SAME EVENT (The Death Hoax). MERGE THEM.
    - Example: "Supreme Court Hearing" and "Hearing Adjourned" ARE THE SAME EVENT. MERGE THEM.
    - If multiple match, pick the best fit.
    
    Output strictly JSON: {{"match_id": -1}} (if no match) or {{"match_id": <ID>}}
    """
    
    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        print(f"   🤖 AI Response: {response.text}")
        result = json.loads(response.text.replace('```json', '').replace('```', '').strip())
        return result.get('match_id', -1)
    except Exception as e:
        print(f"   ⚠️  Similarity Check Error: {e}")
        return -1

# Mock Data
existing_event = {
    "title": "Fact Check Confirms Sonam Wangchuk Did Not Die; Video Was AI-Manipulated",
    "summary": "A recent video circulating online falsely claimed that activist Sonam Wangchuk had died while incarcerated in Jodhpur Central Jail. The news report confirms this video was AI-manipulated, debunking the dangerous misinformation."
}

new_article_title = "Fact Check Debunks False Reports of Activist Sonam Wangchuk's Death Claiming AI Manipulation"
new_article_text = "The article debunks false claims circulating online that Ladakh activist Sonam Wangchuk died in an extrajudicial killing. These reports were identified as being spread via AI-manipulated videos created by journalists."

print("--- TEST 1: Obvious Duplicate ---")
match_id = check_similarity(new_article_title, new_article_text, [existing_event])
print(f"✅ Match ID: {match_id} (Expected: 0)")

print("\n--- TEST 2: Wife's Statement vs Fact Check ---")
wife_article_title = "Sonam Wangchuk's Wife Confirms He Is Safe Amid Viral Death Hoaxes"
wife_article_text = "Sonam Wangchuk's wife confirmed that he is safe and sound following viral deepfake messages announcing his death. The article addresses the spread of false information regarding his well-being."

match_id_2 = check_similarity(wife_article_title, wife_article_text, [existing_event])
print(f"✅ Match ID: {match_id_2} (Expected: 0)")
