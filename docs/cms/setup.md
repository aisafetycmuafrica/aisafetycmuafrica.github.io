# Local Development Setup

> **Target state.** These steps describe how the project *will* run once the M0 Foundations issues are done (see [roadmap.md](roadmap.md#m0-foundations)). If a step doesn't work yet, the issue that adds it is probably still open. Whoever closes an M0 issue updates this file if reality differs.

## Prerequisites

- Python 3.12+
- Node.js 20 LTS+ and npm
- Docker + Docker Compose (for local MySQL)
- Git

## 1. Clone and configure

```bash
git clone https://github.com/aisafetycmuafrica/aisafetycmuafrica.github.io.git
cd aisafetycmuafrica.github.io
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

The defaults in `.env.example` work for local development. You only need R2 and Turnstile keys if you're working on uploads or the contact form. Ask a maintainer for **dev** credentials.

## 2. Start MySQL

```bash
docker compose up -d db adminer
```

- MySQL: `localhost:3306`, database `asica`, user `asica`, password `asica`
- Adminer (DB browser): http://localhost:8080

## 3. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt

alembic upgrade head               # create tables
python -m app.cli create-admin --email you@example.com --name "Your Name"
python -m app.cli seed             # optional: load content migrated from the old site

uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000/api/v1/health
- Swagger docs: http://localhost:8000/docs

**Common tasks:**

```bash
pytest                              # run tests (uses DATABASE_URL_TEST)
ruff check . && ruff format .       # lint + format
alembic revision --autogenerate -m "add events table"   # new migration (review it before committing)
```

## 4. Frontend

```bash
cd frontend
npm install
npm run dev                         # http://localhost:5173
```

- Public site: http://localhost:5173/
- Admin: http://localhost:5173/admin (log in with the admin you created)

**Common tasks:**

```bash
npm run lint
npm run typecheck
npm run test
npm run build && npm run preview
```

## 5. Legacy static site

Until cutover, the original site still lives at the repo root. To view it:

```bash
python -m http.server 8001          # from repo root → http://localhost:8001
```

Use it as the **visual reference** when porting pages.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Can't connect to MySQL server` | `docker compose ps`. Wait about 20 s after the first start for MySQL to initialise. |
| CORS error in the browser | Make sure `CORS_ORIGINS` in `backend/.env` includes `http://localhost:5173` |
| `401` on admin pages | The token expired. Log in again. |
| Image upload fails with a CORS error | The R2 bucket CORS rule must allow `PUT` from `http://localhost:5173` |
