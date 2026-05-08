import os
import time
from google import genai
from typing import List
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_chunks(chunks: List[str]) -> str:
    summaries = []
    
    # SWITCHED TO STABLE MODEL: This avoids the 'Preview 404' bug
    model_id = "gemini-3.1-flash-lite" 

    print(f"--- Processing {len(chunks)} chunks with Stable Engine ---")

    for i, chunk in enumerate(chunks):
        prompt = f"Summarize this section clearly and concisely:\n\n{chunk}"
        
        success = False
        for attempt in range(3):
            try:
                # 10s delay to respect Free Tier RPM limits
                if i > 0 and attempt == 0:
                    time.sleep(10) 

                response = client.models.generate_content(
                    model=model_id, 
                    contents=prompt
                )
                
                if response.text:
                    summaries.append(response.text)
                    print(f"✅ Chunk {i+1} done.")
                    success = True
                    break 
            
            except Exception as e:
                error_msg = str(e).lower()
                
                # If we still hit a 404, try one more stable alias
                if "404" in error_msg:
                    print(f"⚠️ 404 on stable. Trying 'gemini-3-flash-preview'...")
                    model_id = "gemini-3-flash-preview"
                    time.sleep(5)
                    continue

                if "503" in error_msg or "429" in error_msg:
                    wait_time = (attempt + 1) * 20
                    print(f"⏳ Server Busy. Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    print(f"❌ Error in chunk {i+1}: {e}")
                    time.sleep(5)

    if not summaries:
        return "System Error: Neural connectivity failed. Check your API Key permissions."

    print("--- Finalizing Report ---")
    time.sleep(5)
    final_prompt = "Provide a structured intelligence report based on these summaries:\n\n" + "\n".join(summaries)
    
    try:
        final_response = client.models.generate_content(model=model_id, contents=final_prompt)
        return final_response.text
    except:
        return "\n\n".join(summaries)