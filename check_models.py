import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

print("Models your key can actually see:")
for m in client.models.list():
    print(f" - {m.name}")