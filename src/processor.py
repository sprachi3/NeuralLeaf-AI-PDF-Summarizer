from typing import List

def create_chunks(text: str, chunk_size: int = 5000, overlap: int = 200) -> List[str]:
    """
    Splits a large string into smaller overlapping chunks.
    
    Args:
        text (str): The massive string from the PDF.
        chunk_size (int): Maximum characters per chunk.
        overlap (int): Number of characters to repeat from the previous chunk.
        
    Returns:
        List[str]: A list of text segments.
    """
    chunks = []
    start = 0
    
    # Simple recursive-style splitting logic
    while start < len(text):
        # Define the end of the chunk
        end = start + chunk_size
        
        # Extract the chunk
        chunk = text[start:end]
        chunks.append(chunk)
        
        # Move the start pointer forward, but subtract overlap
        # This ensures the AI understands the transition between chunks
        start += (chunk_size - overlap)
        
    return chunks

if __name__ == "__main__":
    # Test logic
    sample_text = "This is a very long string " * 100
    test_chunks = create_chunks(sample_text, chunk_size=100, overlap=20)
    
    print(f"Total Chunks created: {len(test_chunks)}")
    print(f"First Chunk: {test_chunks[0]}")
    print(f"Second Chunk (Notice the overlap): {test_chunks[1]}")