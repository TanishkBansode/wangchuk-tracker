import json
from config import MODEL_ID
from src.ai_client import call_with_retry

def analyze_article(text, original_title, topic_name):
    # print(f"   🧠 Asking Gemini to analyze...") # Moved to inside function for cleaner logs
    prompt = f"""
    Role: You are a senior news editor and focused reporter.
    Task: Extract the core news story about {topic_name} from the raw text below.
    
    Constraints:
    - IGNORE all ads, promotional material, "read more" links, and unrelated sidebars.
    - NO meta-commentary. Do NOT start with "The article discusses", "This text is about", or "According to the report".
    - Report the facts directly and objectively (e.g. "Air pollution levels in Pune spiked on Tuesday..." instead of "The article says pollution spiked...").
    - If the text is just a collection of ads or snippets with no real story, set is_relevant: false.

    Article Title: {original_title}
    Article Text (Raw): {text[:30000]}

    JSON Output Requirements:
    1. is_relevant: boolean. Is there a coherent news story about {topic_name}?
    2. is_clickbait: boolean. Does the title exaggerate the actual content?
    3. priority: "High" (Breaking/Urgent), "Medium" (Important), "Low" (Routine).
    4. new_title: Write a professional, objective headline for this story.
    5. summary: Two concise sentences giving the latest facts. Include specific details (dates, numbers, names). NO filler.

    Output strictly JSON:
    {{
        "is_relevant": true,
        "is_clickbait": false,
        "priority": "Medium",
        "new_title": "...",
        "summary": "..."
    }}
    """
    
    response = call_with_retry(MODEL_ID, prompt)
    if response:
        try:
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_text)
        except:
            return None
    return None
