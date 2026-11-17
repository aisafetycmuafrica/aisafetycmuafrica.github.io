# Architecture

## Overview

```
                ┌──────────────────────────────┐
                │  Browser (public + admin)    │
                └──────┬───────────────┬───────┘
                       │ HTML/JS/CSS   │ JSON over HTTPS
                       ▼               ▼
        ┌──────────────────┐   ┌────────────────────────┐
        │ GitHub Pages     │   │ Vercel                 │
        │ React SPA        │   │ FastAPI (serverless)   │
        │ (frontend/dist)  │   │ /api/v1/...            │
        └──────────────────┘   └──────┬─────────┬───────┘
                                      │ SQL     │ S3 API (sign URLs,
                                      ▼         ▼  delete objects)
                          ┌─────────────┐   ┌─────────────────┐
                          │ MySQL 8     │   │ Cloudflare R2   │
                          │ (hosted)    │   │ images bucket   │
                          └─────────────┘   └────────▲────────┘
                                                     │ direct PUT with
              Browser ───────────────────────────────┘ presigned URL
```

- The **public site** and the **admin dashboard** are the same React app. Admin routes live under `/admin` and need a login.
- The React app is a static build, so it can be hosted anywhere: GitHub Pages now, Vercel later.
- The **API** is the only thing that talks to MySQL and holds secrets.
- **Images never pass through the API.** The API signs an upload URL, and the browser uploads straight to R2 (see [Image uploads](#image-uploads-cloudflare-r2)).

## Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Database | **MySQL** (over MongoDB) | The content is relational: posts → authors (team members), events → speakers, projects → members, everything → media. Foreign keys, unique slugs and Alembic migrations catch mistakes early, which matters with many student contributors. |
| ORM | SQLAlchemy 2 (typed `Mapped[]` style) + Alembic | The standard for FastAPI, with lots of learning material. |
| Validation | Pydantic v2 schemas | Built into FastAPI. Gives an automatic OpenAPI spec at `/docs`. |
| Frontend | React + Vite + TypeScript | Fast dev server, simple static build, types catch API mismatches. |
| Data fetching | TanStack Query | Caching, loading and error states, and refetching after mutations. |
| Forms | React Hook Form + Zod | Same validation rules on the client as the Pydantic schemas. |
| Content format | Markdown (stored as text, rendered with `react-markdown`) | Easy to write and review, no HTML injection. |
| Images | Cloudflare R2 | S3-compatible, free egress, generous free tier. |
| API hosting | Vercel Python runtime | Free tier, preview deploys per PR, the frontend can move there later. |

## Repository layout (target)

The repo becomes a monorepo. **The legacy static site stays at the root, untouched, until cutover** (see [roadmap.md](roadmap.md#cutover-plan)).

```
aisafetycmuafrica.github.io/
├── index.html, about.html, …      # legacy static site (removed at cutover)
├── assets/                        # legacy assets (style.css is ported to frontend)
├── docs/cms/                      # these docs
├── docker-compose.yml             # local MySQL (+ Adminer)
├── .github/workflows/
│   ├── backend-ci.yml
│   ├── frontend-ci.yml
│   └── deploy-pages.yml           # added at cutover
├── backend/
│   ├── api/index.py               # Vercel entrypoint: `from app.main import app`
│   ├── vercel.json
│   ├── pyproject.toml / requirements.txt
│   ├── alembic.ini
│   ├── alembic/versions/
│   ├── app/
│   │   ├── main.py                # create_app(): routers, CORS, error handlers
│   │   ├── core/                  # config.py (pydantic-settings), security.py, db.py
│   │   ├── models/                # SQLAlchemy models, one file per module
│   │   ├── schemas/               # Pydantic request/response models
│   │   ├── api/
│   │   │   ├── deps.py            # get_db, get_current_user, require_role
│   │   │   ├── public/            # read-only public routers
│   │   │   └── admin/             # authenticated CRUD routers
│   │   ├── services/              # business logic (slugify, r2, email, turnstile)
│   │   └── cli.py                 # create-admin, seed
│   └── tests/
└── frontend/
    ├── index.html
    ├── vite.config.ts
    ├── public/                    # favicons, 404.html (SPA fallback)
    └── src/
        ├── main.tsx, App.tsx, router.tsx
        ├── styles/style.css       # ported from assets/style.css
        ├── lib/api.ts             # fetch wrapper, base URL from env, auth header
        ├── components/            # Nav, Footer, cards, Markdown, ImageUpload…
        ├── pages/                 # public pages
        └── admin/                 # admin layout + pages per module
```

## Backend conventions

- **Routers per module.** Example: `app/api/public/events.py` and `app/api/admin/events.py`.
- **Routes stay thin.** Logic lives in `services/` when it's more than CRUD.
- **Schemas per module.** Each module has `XCreate`, `XUpdate` (all fields optional, used for PATCH) and `XRead` (response).
- **Slugs** are generated from the title on create and are unique per table. They can be edited, and a collision gets a `-2`, `-3`… suffix.
- **Timestamps** are stored in UTC. The frontend formats them for Africa/Kigali.
- **Errors** use one JSON shape. See [api.md](api.md#errors).
- **Tests** use pytest with httpx `TestClient` against a MySQL test database (CI runs MySQL as a service container).
- **Lint and format** with `ruff`.

## Frontend conventions

- Keep the existing **class names and CSS** from `assets/style.css`. The goal is visual parity.
- **Shared layout.** `Nav` and `Footer` are written once as components, replacing 16 copies.
- **API base URL** comes from `import.meta.env.VITE_API_URL`.
- **Pages render from API data** and show loading skeletons and friendly error states.
- Markdown is rendered with `react-markdown` + `remark-gfm`. **Raw HTML is disabled.**
- Lint with `eslint`, type-check with `tsc --noEmit`, and unit test with `vitest` where it makes sense.

## Authentication & roles

- Only staff log in. No public sign-up.
- `users` table with `email`, `password_hash` (argon2 via `pwdlib` / `passlib[argon2]`), `role`, and `is_active`.
- **Roles:**
  - `admin` can do everything, including managing users and the organization profile.
  - `editor` can create and edit events, posts and projects, and read contact messages.
- **Login:** `POST /api/v1/auth/login` returns a short-lived **JWT access token** (e.g. 60 min). The SPA keeps it in memory plus `sessionStorage` and sends `Authorization: Bearer <token>`.
  - We use a bearer token instead of cookies because Pages and Vercel are different domains, which makes cross-site cookies fragile.
- **First admin:** created with the CLI: `python -m app.cli create-admin --email ...`.
- **Route protection:** admin routes use the `require_role("admin" | "editor")` dependency.

## Image uploads (Cloudflare R2)

Vercel functions cap request bodies at **4.5 MB** and have no persistent disk, so uploads go straight to R2:

1. The admin UI calls `POST /api/v1/admin/media/presign` with `{ filename, content_type, size }`.
2. The API validates the request:
   - type is one of `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`, `image/gif`
   - size is at most 5 MB
3. The API builds a key like `uploads/2026/11/<uuid>.<ext>` and returns `{ upload_url, key, public_url }`. `upload_url` is a presigned PUT URL valid for 5 min.
4. The browser `PUT`s the file to `upload_url`.
5. The admin UI calls `POST /api/v1/admin/media` with `{ key, alt_text, width, height }`. The API checks the object exists with a `HEAD` request and stores a `media` row.
6. Content tables reference images by `media_id`. Public responses include the resolved `url`.

**R2 setup:**
- Make the bucket public through an `r2.dev` URL or a custom domain such as `media.<domain>`.
- Add a CORS rule on the bucket that allows `PUT` from the frontend origins.
- Use the `boto3` S3 client with `endpoint_url=https://<account_id>.r2.cloudflarestorage.com`.

## Hosting constraints

### Vercel (API)

- **Entrypoint.** `backend/api/index.py` exposes the FastAPI `app`. `vercel.json` rewrites `/(.*)` to `/api/index`.
- **Serverless.** Every request may be a cold start, so:
  - create the SQLAlchemy engine at module level with `pool_pre_ping=True`, a small `pool_size` (1–2) and `pool_recycle=280`;
  - keep imports light.
- **No background workers.** Contact-form email notifications are sent synchronously during the request, through a transactional email API (e.g. Resend). If sending fails, it's logged and the request still succeeds.
- **Migrations aren't run on deploy.** Run `alembic upgrade head` from CI or by hand against the production database.
- **Database.** MySQL must be hosted somewhere reachable over TLS, for example Aiven for MySQL or TiDB Cloud Serverless (MySQL-compatible). Picking the provider is part of the deploy issue.

### GitHub Pages (frontend)

- **Site root.** This is an org site served at the domain root, so Vite uses `base: "/"`.
- **SPA deep links.** Pages has no rewrites. We use the `404.html` redirect trick (`spa-github-pages` pattern) so deep links like `/blog/week-3-…` work. If that turns out fragile, `HashRouter` is the fallback.
- **Deploy.** The `deploy-pages.yml` GitHub Actions workflow builds `frontend/` and publishes `frontend/dist`.
- **CORS.** The API allows `https://aisafetycmuafrica.github.io` and `http://localhost:5173`.
- **SEO.** The content is client-rendered, so we add per-page `<title>`/meta with `react-helmet-async` and generate a `sitemap.xml` at build time. Moving to Vercel later opens up pre-rendering.

## Environment variables

### Backend (`backend/.env`, Vercel project settings)

| Variable | Example | Notes |
|----------|---------|-------|
| `DATABASE_URL` | `mysql+pymysql://user:pass@host:3306/asica?ssl=true` | |
| `JWT_SECRET` | random 64 chars | |
| `JWT_EXPIRES_MINUTES` | `60` | |
| `CORS_ORIGINS` | `https://aisafetycmuafrica.github.io,http://localhost:5173` | comma-separated |
| `R2_ACCOUNT_ID` | | |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | | R2 API token scoped to the bucket |
| `R2_BUCKET` | `asica-media` | |
| `R2_PUBLIC_BASE_URL` | `https://media.example.org` | prefix for public image URLs |
| `TURNSTILE_SECRET_KEY` | | Cloudflare Turnstile (contact form) |
| `RESEND_API_KEY` / `CONTACT_NOTIFY_EMAIL` | | optional email notifications |

### Frontend (`frontend/.env`, GitHub Actions variables)

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://asica-api.vercel.app/api/v1` |
| `VITE_TURNSTILE_SITE_KEY` | |

Commit an `.env.example` for both. **Never commit real secrets.**
