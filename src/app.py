import os
from src.extractor import extract_text_from_pdf
from src.processor import create_chunks
from src.summarizer import summarize_chunks

def run_full_pipeline(pdf_path: str, output_folder: str = "output"):
    """
    Orchestrates the full process from PDF to Final Summary.
    """
    # 1. Verification
    if not os.path.exists(pdf_path):
        print(f"Error: File '{pdf_path}' not found.")
        return

    # 2. Extraction
    print(f"\n[1/3] Extracting text from: {pdf_path}")
    raw_text = extract_text_from_pdf(pdf_path)
    
    # 3. Processing (Chunking)
    print(f"[2/3] Processing text into chunks...")
    # Adjust chunk_size based on your PDF length
    chunks = create_chunks(raw_text, chunk_size=3000, overlap=300)
    print(f"    - Total characters: {len(raw_text)}")
    print(f"    - Created {len(chunks)} logical chunks.")

    # 4. Summarization (AI Integration)
    print(f"[3/3] Sending to Gemini AI for summarization...")
    final_summary = summarize_chunks(chunks)

    # 5. Save the result
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        
    output_filename = os.path.join(output_folder, "summary.txt")
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write(final_summary)

    print(f"\n✅ Success! Summary saved to: {output_filename}")
    print("-" * 30)
    print("PREVIEW OF SUMMARY:")
    print(final_summary[:500] + "...") 

if __name__ == "__main__":
    # Point this to your specific PDF file in the data folder
    INPUT_PDF = "data/sample.pdf" 
    
    run_full_pipeline(INPUT_PDF)