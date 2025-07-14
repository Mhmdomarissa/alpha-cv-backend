# cv_parser
from fastapi import UploadFile
import fitz  # PyMuPDF
import docx2txt
import os
import tempfile

def extract_text_from_file(file: UploadFile) -> str:
    suffix = file.filename.split(".")[-1].lower()
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, file.filename)

    with open(temp_path, "wb") as f:
        f.write(file.file.read())

    content = ""
    if suffix == "pdf":
        doc = fitz.open(temp_path)
        for page in doc:
            content += page.get_text()
    elif suffix in ["doc", "docx"]:
        content = docx2txt.process(temp_path)
    else:
        raise ValueError("Unsupported file type")

    os.remove(temp_path)
    return content.strip()
