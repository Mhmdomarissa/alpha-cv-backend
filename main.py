from config import QDRANT_URL
from fastapi import FastAPI, File ,UploadFile
from cv_parser import extract_text_from_file
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload_cvs")
async def upload_cvs(
    cv_files: list[UploadFile] = File(...),
    jd_file: UploadFile = File(...)
):
    jd_text = extract_text_from_file(jd_file)

    results = []

    for file in cv_files:
        text = extract_text_from_file(file)
        name = extract_name(text)
        title = extract_title(text)

        results.append({
            "filename": file.filename,
            "full_name": name,
            "job_title": title,
            "content": text
        })

    return {
        "job_description": jd_text,
        "candidates": results
    }

def extract_name(text):
    import re
    lines = text.strip().split("\n")
    for line in lines:
        if len(line.strip().split()) >= 2 and len(line.strip()) < 40:
            return line.strip()
    return "Unknown"

def extract_title(text):
    for keyword in ["Engineer", "Developer", "Manager", "Analyst"]:
        if keyword.lower() in text.lower():
            return keyword
    return "Unknown"
