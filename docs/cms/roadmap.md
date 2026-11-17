# Roadmap

Work is split into milestones. **M0 must be finished before module work starts.** Inside each module, the three issues (API → admin UI → public pages) can partly run in parallel once the API's schemas are agreed on.

Tracking epic: #29. Issue numbers link to GitHub.

Legend: **Deps** lists issues that must be merged first. Labels show which part of the codebase is touched.

## M0 Foundations

Monorepo, backend & frontend skeletons, DB, auth, media uploads, CI, admin shell. Must land before module work.

| # | Issue | Area | Deps |
|---|-------|------|------|
| #1 | Monorepo scaffold: frontend/ and backend/ folders | infra · good first issue | none |
| #2 | Backend skeleton: FastAPI app, settings, health, CORS, errors, Vercel entry | backend | #1 |
| #3 | Database layer: SQLAlchemy 2, Alembic, base model mixins | backend | #2 |
| #4 | Auth: users, password hashing, JWT login, roles, create-admin CLI | backend | #3 |
| #5 | Media: Cloudflare R2 presigned uploads + media library API | backend | #4 |
| #6 | Frontend skeleton: Vite + React + TS, router, ported styles, layout | frontend | #1 |
| #7 | Admin shell: login, protected routes, layout, reusable form & upload components | admin | #6, #4, #5 |
| #8 | CI: backend and frontend checks on pull requests | infra | #2, #6 |

## M1 Org Profile

Organization profile, team members, programs: API, admin UI, public pages.

| # | Issue | Area | Deps |
|---|-------|------|------|
| #9 | Organization profile, team & programs: backend models & API | backend | #4, #5 |
| #10 | Organization profile, team & programs: admin UI | admin | #9, #7 |
| #11 | Organization profile, team & programs: public pages | frontend | #9, #6 |

## M2 Events

Events and speakers: API, admin UI, public pages.

| # | Issue | Area | Deps |
|---|-------|------|------|
| #12 | Events: backend models & API | backend | #4, #5 |
| #13 | Events: admin UI | admin | #12, #7 |
| #14 | Events: public pages | frontend | #12, #6 |

## M3 Blog

Blog posts, authors, tags: API, admin UI, public pages.

| # | Issue | Area | Deps |
|---|-------|------|------|
| #15 | Blog: backend models & API | backend | #4, #5 |
| #16 | Blog: admin UI | admin | #15, #7 |
| #17 | Blog: public pages | frontend | #15, #6 |

## M4 Contact

Contact form with spam protection and admin inbox.

| # | Issue | Area | Deps |
|---|-------|------|------|
| #18 | Contact us: backend models & API | backend | #4, #5 |
| #19 | Contact us: admin UI | admin | #18, #7 |
| #20 | Contact us: public pages | frontend | #18, #6 |

## M5 Projects

Projects and members: API, admin UI, public pages.

| # | Issue | Area | Deps |
|---|-------|------|------|
| #21 | Projects: backend models & API | backend | #4, #5 |
| #22 | Projects: admin UI | admin | #21, #7 |
| #23 | Projects: public pages | frontend | #21, #6 |

## M6 Migration & Launch

Migrate existing content, SEO, deploy API to Vercel, deploy SPA to Pages, cut over.

| # | Issue | Area | Deps |
|---|-------|------|------|
| #24 | Migrate existing static content into the database | backend | #9, #12, #15 |
| #25 | SEO & polish: meta tags, sitemap, Open Graph, 404 page | frontend | #11, #14, #17 |
| #26 | Deploy API to Vercel with hosted MySQL and R2 | infra, backend | #8, #5 |
| #27 | Deploy frontend to GitHub Pages and cut over from the static site | infra, frontend | #26, #24, #25, #20, #23 |
| #28 | (Later) Move frontend hosting to Vercel | infra, frontend | #27 |

## Dependency overview

```
scaffold ─┬─ backend-skeleton ── database ── auth ── media ─┐
          └─ frontend-skeleton ─────────────────────────────┼── admin-shell
                                                            │
   for each module (org, events, blog, contact, projects):  │
        <module>-api ──┬── <module>-admin  (needs admin-shell)
                       └── <module>-public (needs frontend-skeleton)

   org/events/blog APIs ── migrate-content ─┐
   ci + media ── deploy-api ────────────────┼── deploy-pages (cutover) ── vercel-frontend (later)
   org/events/blog public ── seo ───────────┘
```

## Cutover plan

1. Until cutover, the **legacy static site stays at the repo root**, and GitHub Pages keeps serving it from `main` / root. New code lives only in `frontend/` and `backend/`, so nothing the public sees changes.
2. The API is deployed to Vercel and production content is seeded (the deploy-api and migrate-content issues).
3. The new frontend is checked against production data with `npm run build && npm run preview` (pointed at the prod API) and in a Vercel or Pages preview.
4. The Pages source is switched to **GitHub Actions** and `deploy-pages.yml` publishes `frontend/dist`. **Rollback:** switch the Pages source back to `main` / root.
5. After about a week of stable operation, the legacy HTML and `assets/` are deleted from the root and the root README is updated.
6. Later: the frontend moves to Vercel.

## Changing this roadmap

When scope changes, open or close issues on GitHub first, then update this table in the same PR.
