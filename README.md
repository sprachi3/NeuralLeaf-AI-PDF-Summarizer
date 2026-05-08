# NEURALLEAF 🌿 | AI-Powered PDF Intelligence

NeuralLeaf is a high-performance RAG (Retrieval-Augmented Generation) application that distills complex research documents into structured intelligence reports using **Gemini 3.1 Flash**.

## 🚀 Features
* **Neural Summarization**: Context-aware chunking for long-form PDFs.
* **Deep Context Chat**: Interactive RAG-based Q&A with document text.
* **Intelligence Reports**: Export analyzed data to formatted PDFs.

## 🛠️ Tech Stack
* **Frontend**: Next.js 15, Framer Motion, Tailwind CSS
* **Backend**: FastAPI (Python 3.12), Google GenAI SDK
* **AI Model**: Gemini 3.1 Flash-Lite

## 📦 Setup & Installation
1. Clone the repository.
2. Install Python dependencies: `pip install -r requirements.txt`
3. Install Frontend dependencies: `cd web-ui && npm install`
4. Setup `.env` with your `GEMINI_API_KEY`.
5. Run Backend: `python -m src.api_bridge`
6. Run Frontend: `cd web-ui && npm run dev`