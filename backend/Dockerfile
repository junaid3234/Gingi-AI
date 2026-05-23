FROM python:3.11-slim

WORKDIR /app

# System deps for asyncpg
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl && rm -rf /var/lib/apt/lists/*

# Install all backend + ML dependencies in one layer
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML model (pre-trained)
COPY ml-model/ /ml-model/

# Copy backend source
COPY backend/ .

# Environment defaults (overridden by Railway env vars)
ENV MODEL_PATH=/ml-model/models/gingivitis_rf_model.joblib
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=8000

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
