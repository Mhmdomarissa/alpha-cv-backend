
from fastapi import FastAPI, UploadFile, File
import os
from utils.file_utils import extract_text_from_file, extract_candidate_info
from utils.vector_utils import create_collection_if_not_exists, store_vector

app = FastAPI()

@app.on_event("startup")
def startup_event():
    create_collection_if_not_exists()

@app.post("/upload/")
async def upload_files(files: list[UploadFile] = File(...), jd: UploadFile = File(...)):
    response = []
    os.makedirs("tmp", exist_ok=True)

    # Process job description file
    jd_path = f"tmp/{jd.filename}"
    with open(jd_path, "wb") as f:
        f.write(await jd.read())
    job_text = extract_text_from_file(jd_path)

    for file in files:
        file_path = f"tmp/{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())

        raw_text = extract_text_from_file(file_path)
        info = extract_candidate_info(raw_text)
        store_vector(info)
        response.append(info)

    return {"job_description": job_text.strip(), "candidates": response}
