import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fpdf import FPDF
from fastapi.responses import FileResponse
from google import genai
from dotenv import load_dotenv

# Relative imports for the local package
from .extractor import extract_text_from_pdf
from .processor import create_chunks
from .summarizer import summarize_chunks

# 1. Initialize App & AI Client
load_dotenv()
app = FastAPI(title="NeuralLeaf API")
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# 2. Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store context for RAG Chat
last_extracted_text = ""

@app.post("/summarize")
async def handle_summarize(file: UploadFile = File(...)):
    global last_extracted_text
    
    temp_dir = "temp_uploads"
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)

    file_path = os.path.join(temp_dir, file.filename)

    try:
        # STEP A: SAVE FILE
        print(f"📥 Receiving: {file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # STEP B: EXTRACT
        print(f"🚀 Processing Text...")
        text = extract_text_from_pdf(file_path)
        last_extracted_text = text 

        # STEP C: AI PIPELINE
        chunks = create_chunks(text)
        summary = summarize_chunks(chunks)

        return {"summary": summary}

    except Exception as e:
        print(f"❌ Summarize Error: {e}")
        return {"error": str(e)}

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/chat")
async def chat_with_pdf(payload: dict = Body(...)):
    global last_extracted_text
    question = payload.get("question")
    
    if not last_extracted_text:
        return {"error": "No document context found."}

    try:
        # Use the Stable model here too
        model_id = "gemini-3.1-flash-lite"
        
        chat_prompt = f"""
        Research Assistant. Answer based on the text below. 
        TEXT: {last_extracted_text[:30000]}
        QUESTION: {question}
        """
        
        response = client.models.generate_content(
            model=model_id,
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
    
    # Branding
    pdf.set_fill_color(16, 185, 129)
    pdf.rect(0, 0, 210, 40, 'F')
    pdf.set_font("Arial", 'B', 24)
    pdf.set_text_color(255, 255, 255)
    pdf.text(10, 25, "NEURALLEAF REPORT")
    
    pdf.set_y(50)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="Document Analysis Summary", ln=True, align='L')
    pdf.ln(5)
    
    pdf.set_font("Arial", size=11)
    pdf.multi_cell(0, 10, txt=summary_text)
    
    export_path = "summary_export.pdf"
    pdf.output(export_path)
    
    return FileResponse(export_path, filename="NeuralLeaf_Summary.pdf")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)