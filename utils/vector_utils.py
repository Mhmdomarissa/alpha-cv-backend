from sentence_transformers import SentenceTransformer
from qdrant_client.models import PointStruct, VectorParams, Distance
from qdrant_client import QdrantClient
import uuid
import time
import os
from qdrant_client.http.exceptions import ResponseHandlingException
from typing import List, Dict, Any

COLLECTION_NAME = "cv_vectors"

# Get Qdrant connection details from environment or use defaults
QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))

# Initialize client and model
try:
    client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT, timeout=30)
    print(f"Connecting to Qdrant at {QDRANT_HOST}:{QDRANT_PORT}")
except Exception as e:
    print(f"Warning: Could not connect to Qdrant: {e}")
    client = None

model = SentenceTransformer("all-MiniLM-L6-v2")

def create_collection_if_not_exists():
    """Create the Qdrant collection if it doesn't exist."""
    if not client:
        print("Qdrant client not initialized")
        return
    
    for attempt in range(10):
        try:
            collections = client.get_collections().collections
            if COLLECTION_NAME not in [c.name for c in collections]:
                print("Creating Qdrant collection...")
                client.create_collection(
                    collection_name=COLLECTION_NAME,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
                )
                print(f"Created collection: {COLLECTION_NAME}")
            else:
                print(f"Qdrant collection '{COLLECTION_NAME}' already exists.")
            return
        except ResponseHandlingException as e:
            print(f"Qdrant not ready (attempt {attempt + 1}/10): {e}")
            time.sleep(3)
        except Exception as e:
            print(f"Error creating collection: {e}")
            time.sleep(3)
    raise RuntimeError("Qdrant not available after 10 attempts")

def embed_text(text: str) -> List[float]:
    """Convert text to embedding vector."""
    return model.encode(text).tolist()

def store_vector(data: dict) -> str:
    """Store candidate data in the vector database."""
    if not client:
        raise RuntimeError("Qdrant client not initialized")
    
    # Generate unique ID
    point_id = str(uuid.uuid4())
    
    # Ensure required fields are present
    job_title = data.get("job_title", "Unknown")
    full_name = data.get("full_name", "Unknown")
    full_text = data.get("full_text", "")
    
    if not full_text:
        raise ValueError("Cannot store empty text")
    
    # Create point with metadata
    point = PointStruct(
        id=point_id,
        vector=embed_text(full_text),
        payload={
            "full_name": full_name,
            "job_title": job_title,
            "full_text": full_text,
            "filename": data.get("filename", ""),
            "lines_count": data.get("lines_count", 0),
            "words_count": data.get("words_count", 0),
            "timestamp": time.time()
        }
    )
    
    # Store in Qdrant
    client.upsert(collection_name=COLLECTION_NAME, points=[point])
    return point_id

def search_candidates(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Search for candidates matching the query using vector similarity."""
    if not client:
        raise RuntimeError("Qdrant client not initialized")
    
    if not query:
        raise ValueError("Search query cannot be empty")
    
    # Convert query to vector
    query_vector = embed_text(query)
    
    # Search in Qdrant
    search_result = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=limit
    )
    
    # Format results
    results = []
    for hit in search_result:
        result = {
            "id": hit.id,
            "score": hit.score,
            "full_name": hit.payload.get("full_name", "Unknown"),
            "job_title": hit.payload.get("job_title", "Unknown"),
            "filename": hit.payload.get("filename", ""),
            "lines_count": hit.payload.get("lines_count", 0),
            "words_count": hit.payload.get("words_count", 0),
            "timestamp": hit.payload.get("timestamp", 0),
            "text_preview": hit.payload.get("full_text", "")[:200] + "..."
        }
        results.append(result)
    
    return results

def get_all_candidates(limit: int = 100) -> List[Dict[str, Any]]:
    """Retrieve all candidates from the vector database."""
    if not client:
        raise RuntimeError("Qdrant client not initialized")
    
    try:
        # Get collection info
        collection_info = client.get_collection(COLLECTION_NAME)
        total_points = collection_info.points_count
        
        if total_points == 0:
            return []
        
        # Scroll through all points
        points, _ = client.scroll(
            collection_name=COLLECTION_NAME,
            limit=min(limit, total_points),
            with_payload=True,
            with_vectors=False
        )
        
        # Format results
        candidates = []
        for point in points:
            candidate = {
                "id": point.id,
                "full_name": point.payload.get("full_name", "Unknown"),
                "job_title": point.payload.get("job_title", "Unknown"),
                "filename": point.payload.get("filename", ""),
                "lines_count": point.payload.get("lines_count", 0),
                "words_count": point.payload.get("words_count", 0),
                "timestamp": point.payload.get("timestamp", 0)
            }
            candidates.append(candidate)
        
        # Sort by timestamp (newest first)
        candidates.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
        
        return candidates
    
    except Exception as e:
        print(f"Error retrieving candidates: {e}")
        return []

def delete_candidate(candidate_id: str) -> bool:
    """Delete a candidate from the vector database."""
    if not client:
        raise RuntimeError("Qdrant client not initialized")
    
    try:
        client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=[candidate_id]
        )
        return True
    except Exception as e:
        print(f"Error deleting candidate {candidate_id}: {e}")
        return False

def clear_all_candidates() -> bool:
    """Clear all candidates from the vector database."""
    if not client:
        raise RuntimeError("Qdrant client not initialized")
    
    try:
        # Delete and recreate the collection
        client.delete_collection(collection_name=COLLECTION_NAME)
        create_collection_if_not_exists()
        return True
    except Exception as e:
        print(f"Error clearing candidates: {e}")
        return False
