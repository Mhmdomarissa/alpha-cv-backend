from sentence_transformers import SentenceTransformer
from qdrant_client.models import PointStruct
from qdrant_client import QdrantClient
import uuid
import time
from qdrant_client.http.exceptions import ResponseHandlingException

COLLECTION_NAME = "cv_vectors"
client = QdrantClient(host="qdrant", port=6333)
model = SentenceTransformer("all-MiniLM-L6-v2")

def create_collection_if_not_exists():
    for attempt in range(10):
        try:
            collections = client.get_collections().collections
            if COLLECTION_NAME not in [c.name for c in collections]:
                print("Creating Qdrant collection...")
                client.create_collection(
                    collection_name=COLLECTION_NAME,
                    vectors_config={"size": 384, "distance": "Cosine"}
                )
            else:
                print("Qdrant collection already exists.")
            return
        except ResponseHandlingException as e:
            print(f"Qdrant not ready (attempt {attempt + 1}/10): {e}")
            time.sleep(3)
    raise RuntimeError("Qdrant not available after 10 attempts")

def embed_text(text: str):
    return model.encode(text).tolist()

def store_vector(data: dict):
    # Ensure job_title is always present, even if fallback to 'Unknown'
    job_title = data.get("job_title", "Unknown")
    point = PointStruct(
        id=str(uuid.uuid4()),
        vector=embed_text(data["full_text"]),
        payload={
            "full_name": data.get("full_name", "Unknown"),
            "job_title": job_title,
            "full_text": data["full_text"]
        }
    )
    client.upsert(collection_name=COLLECTION_NAME, points=[point])
