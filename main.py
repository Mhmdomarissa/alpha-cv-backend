
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import shutil
from typing import List
from contextlib import asynccontextmanager
from utils.file_utils import extract_text_from_file, extract_candidate_info
from utils.vector_utils import create_collection_if_not_exists, store_vector, search_candidates

# Cleanup function for temporary files
def cleanup_tmp_dir():
    if os.path.exists("tmp"):
        shutil.rmtree("tmp")
    os.makedirs("tmp", exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    cleanup_tmp_dir()
    create_collection_if_not_exists()
    yield
    # Shutdown
    cleanup_tmp_dir()

app = FastAPI(
    title="CV Analyzer API",
    description="API for analyzing CVs and matching them with job descriptions",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "CV Analyzer API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "cv-analyzer-backend",
        "version": "1.0.0"
    }

@app.post("/upload/", summary="Upload CVs and Job Description")
async def upload_files(
    files: List[UploadFile] = File(..., description="CV files to analyze"),
    jd: UploadFile = File(..., description="Job description file")
):
    """
    Upload multiple CV files and a job description for analysis.
    Supported formats: PDF, DOCX, TXT
    """
    try:
        response = []
        os.makedirs("tmp", exist_ok=True)
        
        # Validate file formats
        allowed_extensions = ['.pdf', '.docx', '.txt']
        
        # Validate job description file
        jd_ext = os.path.splitext(jd.filename)[1].lower()
        if jd_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Job description file format not supported. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Process job description file
        jd_path = f"tmp/{jd.filename}"
        try:
            with open(jd_path, "wb") as f:
                content = await jd.read()
                f.write(content)
            job_text = extract_text_from_file(jd_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing job description: {str(e)}")
        finally:
            # Clean up job description file
            if os.path.exists(jd_path):
                os.remove(jd_path)
        
        # Process CV files
        for file in files:
            # Validate file format
            file_ext = os.path.splitext(file.filename)[1].lower()
            if file_ext not in allowed_extensions:
                response.append({
                    "filename": file.filename,
                    "status": "error",
                    "message": f"File format not supported. Allowed: {', '.join(allowed_extensions)}"
                })
                continue
            
            file_path = f"tmp/{file.filename}"
            try:
                with open(file_path, "wb") as f:
                    content = await file.read()
                    f.write(content)
                
                raw_text = extract_text_from_file(file_path)
                info = extract_candidate_info(raw_text)
                info["filename"] = file.filename
                
                # Store in vector database
                store_vector(info)
                
                response.append({
                    "filename": file.filename,
                    "status": "success",
                    "candidate_info": info
                })
            except Exception as e:
                response.append({
                    "filename": file.filename,
                    "status": "error",
                    "message": str(e)
                })
            finally:
                # Clean up CV file
                if os.path.exists(file_path):
                    os.remove(file_path)
        
        return {
            "job_description": job_text.strip(),
            "candidates": response,
            "summary": {
                "total_files": len(files),
                "successful": len([r for r in response if r["status"] == "success"]),
                "failed": len([r for r in response if r["status"] == "error"])
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/search/", summary="Search for matching candidates")
async def search_matching_candidates(
    query: str,
    limit: int = 5
):
    """
    Search for candidates matching the given query using vector similarity.
    """
    try:
        results = search_candidates(query, limit)
        return {
            "query": query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@app.get("/candidates/", summary="List all candidates")
async def list_candidates(limit: int = 100):
    """
    Retrieve all stored candidates from the vector database.
    """
    try:
        # This would need to be implemented in vector_utils.py
        from utils.vector_utils import get_all_candidates
        candidates = get_all_candidates(limit)
        return {
            "candidates": candidates,
            "count": len(candidates)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving candidates: {str(e)}")

# Error handler for unhandled exceptions
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred", "error": str(exc)}
    )
