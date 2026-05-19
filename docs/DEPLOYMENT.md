# GingiAI Deployment Guide

## Production Checklist

1. Set strong `JWT_SECRET` (32+ random characters)
2. Configure managed PostgreSQL with SSL
3. Store secrets in vault (AWS Secrets Manager, Azure Key Vault, etc.)
4. Enable Clerk production keys with allowed origins
5. Set `CORS_ORIGINS` to your production frontend URL
6. Train model on real clinical data and version artifacts
7. Enable HTTPS via reverse proxy (nginx, Cloudflare, ALB)
8. Configure log aggregation and audit log retention

## Vercel (Frontend)

```bash
cd frontend
vercel --prod
```

Environment variables:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## Railway / Render (Backend)

- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Attach PostgreSQL plugin
- Mount or bake `gingivitis_rf_model.joblib` into image

## AWS Architecture (Reference)

```
CloudFront → S3/Amplify (Next.js)
            → ALB → ECS/Fargate (FastAPI)
            → RDS PostgreSQL
            → S3 (PDF reports, optional)
```

## Health Checks

- Frontend: `/`
- Backend: `/health` (includes DB status)
