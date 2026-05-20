# GingiAI — AI Gingivitis Screening Platform

> AI-assisted gingivitis screening, severity prediction, and personalized oral health recommendations — built by **[JVX Labs](https://jvxlabs.com)**.

![GingiAI](https://img.shields.io/badge/GingiAI-v1.0-teal?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## Overview

GingiAI guides patients through a conversational oral health assessment, predicts gingivitis risk using a Random Forest ML model, and delivers personalized preventive recommendations — in under 10 minutes.

### Key Features

- **Conversational Screening** — ChatGPT-style one-question-at-a-time flow with typing indicators and progress tracking
- **ML Risk Prediction** — Random Forest classifier with confidence scores, severity levels, and feature importance
- **Live Risk Meter** — Animated SVG gauge with real-time risk visualization
- **Clinical Dashboard** — Bar/pie charts, personalized recommendations, downloadable PDF report
- **Admin Analytics** — Severity distribution, screening volume, and submission history
- **HIPAA-style Security** — JWT auth, audit logs, rate limiting, minimal PHI storage
- **Dark Mode** — Full light/dark theme support

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| UI | Framer Motion, Recharts, Radix UI, Lucide Icons |
| Auth | Clerk |
| Backend | FastAPI, Python 3.11+ |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ML | scikit-learn Random Forest, SHAP |
| Infra | Docker, Docker Compose |

---

## Project Structure

```
GingiAI/
├── frontend/          # Next.js 15 app
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/
│   │   └── lib/
│   └── package.json
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── routers/
│   │   ├── services/
│   │   └── main.py
│   └── requirements.txt
├── database/          # SQL schema
├── docs/              # API & deployment docs
├── docker-compose.yml
└── .env.example
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- (Optional) Docker & Docker Compose

### 1. Clone the repo

```bash
git clone https://github.com/vkchavan/GingiAI.git
cd GingiAI
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env        # fill in your values
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`

### 3. Frontend setup

```bash
cd frontend
cp .env.local.example .env.local   # fill in your values
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

### 4. Docker (full stack)

```bash
cp .env.example .env
docker-compose up --build
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:8000`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (optional) |
| `CLERK_SECRET_KEY` | Clerk secret key (optional) |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `DATABASE_URL` | PostgreSQL connection string |

---

## Deploy on Railway

1. Create a Railway project and add **PostgreSQL**.
2. **Backend** service — set **Root Directory** to the repo root (`.`), link Postgres, set `JWT_SECRET` and `CORS_ORIGINS` (your frontend URL).
3. **Frontend** service — set **Root Directory** to `frontend`, set `NEXT_PUBLIC_API_URL` to the backend public URL, then deploy.

Full step-by-step: [Deployment Guide](./docs/DEPLOYMENT.md).

## Docs

- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

---

## Disclaimer

GingiAI is not a medical diagnosis tool. Results are for educational and preventive purposes only. Always consult a licensed dental professional for clinical evaluation and treatment.

---

## License

MIT © 2025 [JVX Labs](https://jvxlabs.com)
