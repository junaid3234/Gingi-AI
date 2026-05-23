# GingiAI Deployment Guide

## Railway (recommended)

Deploy as **three Railway resources** in one project:

1. **PostgreSQL** — add from Railway dashboard (Plugins → PostgreSQL)
2. **Backend API** — FastAPI service
3. **Frontend** — Next.js service

### 1. PostgreSQL

- Create a PostgreSQL database in the same Railway project.
- Railway injects `DATABASE_URL` into linked services automatically.

### 2. Backend API

| Setting | Value |
|---------|--------|
| **Root Directory** | Repository root (`.`) — not `backend/` |
| **Config** | Uses `railway.toml` or `backend/railway.json` at repo root |
| **Builder** | Dockerfile (`backend/Dockerfile`) |

**Build context:** The Dockerfile must be built from the **repository root** so `ml-model/` is included and the model is trained during the image build.

**Variables** (Railway → backend service → Variables):

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Auto-set when PostgreSQL is linked |
| `JWT_SECRET` | Yes | 32+ random characters |
| `CORS_ORIGINS` | Yes | Your frontend public URL, e.g. `https://gingiai.up.railway.app` |
| `CLERK_SECRET_KEY` | No | If using Clerk |
| `MODEL_PATH` | No | Default: `/ml-model/models/gingivitis_rf_model.joblib` in Docker |
| `DATABASE_SSL` | No | Set to `true` if using a public Postgres URL that requires SSL |

**Health check:** `GET /health`

**Start command** (if not using Dockerfile CMD):

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Copy the backend **public URL** (e.g. `https://gingiai-api.up.railway.app`) for the frontend.

### 3. Frontend

| Setting | Value |
|---------|--------|
| **Root Directory** | `frontend` |
| **Config** | `frontend/railway.json` |

**Variables** (set **before** the first successful production build):

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend public URL from step 2 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | No | Clerk dashboard |
| `CLERK_SECRET_KEY` | No | If using Clerk |

> `NEXT_PUBLIC_*` values are baked in at **build time**. After changing them, trigger a **redeploy**.

**Health check:** `GET /`

### 4. Clerk (optional)

In [Clerk Dashboard](https://dashboard.clerk.com) → your app → **Domains**:

- Add your Railway frontend URL to allowed origins.
- Add the same URL for sign-in/sign-up redirects if prompted.

### 5. Post-deploy checklist

- [ ] `GET https://<api>/health` returns `"database": "connected"`
- [ ] Frontend loads and screening chat works end-to-end
- [ ] `CORS_ORIGINS` matches the frontend URL exactly (no trailing slash)
- [ ] `JWT_SECRET` is not the dev default

---

## Docker Compose (local / self-hosted)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Postgres: localhost:5432

Train the model locally (optional):

```bash
cd ml-model
pip install -r requirements.txt
python train.py
```

---

## Vercel (frontend only)

The repo includes a `vercel.json` at the root that points Vercel to the `frontend/` subdirectory automatically.

```bash
# From repo root
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard — it will detect `vercel.json` and configure itself.

**Required environment variables** (Vercel → Project Settings → Environment Variables):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard (optional) |
| `CLERK_SECRET_KEY` | Clerk dashboard (optional) |

> After setting variables, trigger a **Redeploy** so they are baked into the build.

---

## Production checklist

1. Strong `JWT_SECRET` (32+ random characters)
2. Managed PostgreSQL with SSL for public connections
3. `CORS_ORIGINS` set to production frontend URL
4. Clerk production keys and allowed origins
5. HTTPS on all public endpoints (Railway provides this)
6. Enable log retention / monitoring as needed

## Health checks

| Service | Path |
|---------|------|
| Frontend | `/` |
| Backend | `/health` |
