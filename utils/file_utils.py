import os
from docx import Document
from pdfminer.high_level import extract_text as extract_pdf_text

def extract_text_from_file(file_path: str) -> str:
    if file_path.endswith('.pdf'):
        return extract_pdf_text(file_path)
    elif file_path.endswith('.docx'):
        doc = Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs])
    else:
        raise ValueError("Unsupported file format")

def extract_candidate_info(text: str):
    lines = text.splitlines()
    name = lines[0] if lines else "Unknown"
    job_title = lines[1] if len(lines) > 1 else "Unknown"
    return {
        "full_name": name.strip(),
        "job_title": job_title.strip(),
        "full_text": text.strip()
    }
