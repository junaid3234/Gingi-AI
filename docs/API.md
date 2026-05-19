# GingiAI API Reference

Base URL: `http://localhost:8000`

Interactive docs: `/docs` (Swagger UI)

## Chat Flow

### Start session
```http
POST /chat/start
```

### Submit answer
```http
POST /chat/answer
Content-Type: application/json

{
  "session_id": "uuid",
  "question_key": "age",
  "answer": "25"
}
```

## Prediction

```http
POST /predict
Content-Type: application/json

{
  "session_id": "uuid"
}
```

Response includes `has_gingivitis`, `severity`, `confidence`, `risk_level`, `feature_importance`, `recommendations`, `explanation`.

## Reports

- `GET /reports/session/{session_id}` — JSON report
- `GET /reports/session/{session_id}/pdf` — PDF download

## Analytics

- `GET /analytics/overview` — Dashboard metrics
- `GET /analytics/export` — CSV (requires Bearer token)
