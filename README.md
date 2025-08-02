# CV Analyzer Backend

A FastAPI-based backend service for analyzing CVs and matching them with job descriptions using vector similarity search.

## Features

- **File Upload**: Support for PDF, DOCX, and TXT files
- **Text Extraction**: Automatic extraction of text from various file formats
- **Vector Search**: Semantic similarity search using sentence transformers
- **Candidate Management**: Store, search, and retrieve candidate information
- **RESTful API**: Well-documented API with automatic OpenAPI/Swagger documentation
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **Health Checks**: Built-in health monitoring endpoints

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **Qdrant**: Vector database for similarity search
- **Sentence Transformers**: For creating text embeddings
- **Docker & Docker Compose**: For containerization and deployment

## Prerequisites

- Docker and Docker Compose (for containerized deployment)
- Python 3.12+ (for local development)
- 4GB+ RAM (for running the ML models)

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd cv-analyzer-backend
```

2. Create a `.env` file (optional):
```bash
cp .env.example .env
```

3. Start the services:
```bash
docker-compose up -d
```

4. Access the API:
- API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start Qdrant (using Docker):
```bash
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage \
    qdrant/qdrant
```

3. Run the application:
```bash
uvicorn main:app --reload
```

## API Endpoints

### Core Endpoints

- `GET /` - Root endpoint, returns API info
- `GET /health` - Health check endpoint
- `POST /upload/` - Upload CVs and job description
- `POST /search/` - Search for matching candidates
- `GET /candidates/` - List all stored candidates

### API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Usage Examples

### Upload CVs and Job Description

```bash
curl -X POST "http://localhost:8000/upload/" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@cv1.pdf" \
  -F "files=@cv2.docx" \
  -F "jd=@job_description.txt"
```

### Search for Candidates

```bash
curl -X POST "http://localhost:8000/search/" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Python developer with 5 years experience",
    "limit": 5
  }'
```

### List All Candidates

```bash
curl -X GET "http://localhost:8000/candidates/?limit=10" \
  -H "accept: application/json"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `QDRANT_HOST` | Qdrant database host | `localhost` |
| `QDRANT_PORT` | Qdrant database port | `6333` |

## Project Structure

```
cv-analyzer-backend/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── Dockerfile          # Docker container definition
├── docker-compose.yml  # Multi-container setup
├── .env.example        # Example environment variables
├── utils/
│   ├── file_utils.py   # File processing utilities
│   └── vector_utils.py # Vector database operations
└── tmp/                # Temporary file storage
```

## Development

### Adding New File Formats

To add support for new file formats, update the `extract_text_from_file` function in `utils/file_utils.py`.

### Modifying the ML Model

The project uses `all-MiniLM-L6-v2` by default. To use a different model, update the model name in `utils/vector_utils.py`.

## Troubleshooting

### Qdrant Connection Issues

If you see "Qdrant not ready" errors:
1. Ensure Qdrant is running: `docker ps | grep qdrant`
2. Check Qdrant logs: `docker logs cv-analyzer-qdrant`
3. Verify port availability: `netstat -an | grep 6333`

### File Upload Issues

- Ensure uploaded files are in supported formats (PDF, DOCX, TXT)
- Check file permissions in the `tmp/` directory
- Verify disk space availability

## Security Considerations

- The current CORS configuration allows all origins (`*`). In production, specify allowed origins.
- Add authentication/authorization as needed
- Implement rate limiting for production use
- Sanitize file uploads and implement size limits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license information here]