import os
import shutil
from fastapi import FastAPI, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from fpdf import FPDF
from fastapi.responses import FileResponse
from google import genai
from dotenv import load_dotenv

from .extractor import extract_text_from_pdf
from .processor import create_chunks
from .summarizer import summarize_chunks

# 1. Initialize App & AI Client
load_dotenv()
app = FastAPI(title="NeuralLeaf API")
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# 2. Updated CORS for Production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "https://neural-leaf-ai-pdf-summarizer.vercel.app" # Your Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

last_extracted_text = ""

@app.post("/summarize")
async def handle_summarize(file: UploadFile = File(...)):
    global last_extracted_text
    temp_dir = "temp_uploads"
    if not os.path.exists(temp_dir): os.makedirs(temp_dir)
    file_path = os.path.join(temp_dir, file.filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"🚀 Processing: {file.filename}")
        text = extract_text_from_pdf(file_path)
        last_extracted_text = text 

        chunks = create_chunks(text)
        summary = summarize_chunks(chunks)
        return {"summary": summary}

    except Exception as e:
        print(f"❌ Error: {e}")
        return {"error": str(e)}
    finally:
        if os.path.exists(file_path): os.remove(file_path)

@app.post("/chat")
async def chat_with_pdf(payload: dict = Body(...)):
    global last_extracted_text
    question = payload.get("question")
    if not last_extracted_text: return {"error": "No context found."}

    try:
        chat_prompt = f"Using this document text, answer clearly: {last_extracted_text[:30000]}\nQuestion: {question}"
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=chat_prompt
        )
        return {"answer": response.text}
    except Exception as e:
        return {"error": str(e)}

@app.post("/export-pdf")
async def export_pdf(data: dict):
    summary_text = data.get("summary", "")
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=11)
    pdf.multi_cell(0, 10, txt=summary_text)
    export_path = "summary_export.pdf"
    pdf.output(export_path)
    return FileResponse(export_path, filename="NeuralLeaf_Summary.pdf")

if __name__ == "__main__":
    import uvicorn
    # 0.0.0.0 is necessary for Render to bind to the port
    uvicorn.run(app, host="0.0.0.0", port=8000)