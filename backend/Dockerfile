FROM python:3.11-slim

WORKDIR /app

# System deps for psycopg2/asyncpg
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML model (pre-trained)
COPY ml-model/ /ml-model/

# Install ML inference deps
RUN pip install --no-cache-dir scikit-learn==1.5.2 pandas==2.2.3 numpy==1.26.4 joblib==1.4.2

# Copy backend source
COPY backend/ .

# Environment defaults (overridden by Railway env vars)
ENV MODEL_PATH=/ml-model/models/gingivitis_rf_model.joblib
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=8000

EXPOSE 8000

# Use shell form so $PORT env var is expanded at runtime
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
