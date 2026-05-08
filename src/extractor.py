import fitz  # PyMuPDF
import re
import os

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extracts and cleans text from a PDF file.
    
    Args:
        pdf_path (str): The path to the PDF document.
        
    Returns:
        str: Cleaned text extracted from the document.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"No file found at {pdf_path}")

    doc = fitz.open(pdf_path)
    text_list = []

    for page in doc:
        # Extract text using a method that preserves some layout logic
        raw_text = page.get_text("text")
        
        # Clean up common PDF artifacts (ligatures, extra spaces, etc.)
        cleaned_text = re.sub(r'\s+', ' ', raw_text).strip()
        text_list.append(cleaned_text)

    return " ".join(text_list)

if __name__ == "__main__":
    # This allows you to test the file independently
    test_path = "data/sample.pdf" # Make sure a PDF exists here!
    try:
        print(extract_text_from_pdf(test_path)[:500]) # Print first 500 chars
    except Exception as e:
        print(f"Error: {e}")