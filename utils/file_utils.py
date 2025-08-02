import os
from docx import Document
from pdfminer.high_level import extract_text as extract_pdf_text

def extract_text_from_file(file_path: str) -> str:
    """Extract text content from various file formats."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    file_ext = os.path.splitext(file_path)[1].lower()
    
    try:
        if file_ext == '.pdf':
            return extract_pdf_text(file_path)
        elif file_ext == '.docx':
            doc = Document(file_path)
            return "\n".join([p.text for p in doc.paragraphs])
        elif file_ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
    except Exception as e:
        raise Exception(f"Error extracting text from {file_path}: {str(e)}")

def extract_candidate_info(text: str) -> dict:
    """Extract candidate information from text content."""
    if not text:
        return {
            "full_name": "Unknown",
            "job_title": "Unknown",
            "full_text": ""
        }
    
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    
    # Try to extract name (usually first non-empty line)
    name = lines[0] if lines else "Unknown"
    
    # Try to extract job title (usually second line or line containing common job keywords)
    job_title = "Unknown"
    if len(lines) > 1:
        job_title = lines[1]
    
    # Look for common job title patterns in the first few lines
    job_keywords = ["developer", "engineer", "manager", "analyst", "designer", 
                    "architect", "consultant", "specialist", "coordinator", "director"]
    
    for i, line in enumerate(lines[:5]):  # Check first 5 lines
        if any(keyword in line.lower() for keyword in job_keywords):
            job_title = line
            break
    
    return {
        "full_name": name.strip(),
        "job_title": job_title.strip(),
        "full_text": text.strip(),
        "lines_count": len(lines),
        "words_count": len(text.split())
    }
