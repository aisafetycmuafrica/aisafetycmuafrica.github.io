# ASICA CMS: Migration Guide

This folder is the source of truth for moving the ASICA website from hand-edited static HTML to a small **content management system (CMS)**. The core team will then be able to update the organization profile, events, blog, contact messages and projects from an admin dashboard. No HTML editing needed.

> **Status:** Planning. No application code exists yet. Every piece of work is tracked as a GitHub issue. See [roadmap.md](roadmap.md) and the [tracking epic #29](https://github.com/aisafetycmuafrica/aisafetycmuafrica.github.io/issues/29).

## Why we are doing this

Today every page is a standalone HTML file, and the nav and footer are copied into all of them. Adding a blog post or event means:

- copying an existing file,
- editing raw HTML,
- updating the index pages by hand,
- and opening a PR.

That works for a few people, but it doesn't scale to a rotating student core team. A CMS lets non-developers publish content safely while developers own the code.

## Goals

- **Manage the organization profile** (CRUD): name, mission, about text, socials, team members, programs.
- **Manage events** (CRUD): talks, hackathons, application windows, with upcoming and past views.
- **Manage the blog** (CRUD): weekly recaps and announcements, drafts, authors, tags.
- **Manage contact messages**: a real contact form in place of `mailto:` links, plus an admin inbox.
- **Manage projects** (CRUD): research and hackathon projects with members and links.
- Keep the **current look and feel**. We are porting `assets/style.css`, not redesigning.
- Make the codebase **approachable for student contributors**: small, well-scoped issues.

## Non-goals (for now)

- Multi-tenant or multi-organization support.
- Public user accounts, comments or likes. Only admins and editors log in.
- A visual page builder. Content is structured fields plus Markdown.
- Replacing the Airtable application forms. Those links stay as they are.

## Stack at a glance

| Layer         | Choice                                   |
|---------------|------------------------------------------|
| Frontend      | React 18 + Vite + TypeScript, React Router |
| Backend       | Python 3.12 + FastAPI                    |
| Database      | MySQL 8 (SQLAlchemy 2 + Alembic)         |
| Image storage | Cloudflare R2 (S3-compatible)            |
| API hosting   | Vercel (Python serverless functions)     |
| Site hosting  | GitHub Pages for now, Vercel later       |

Why these choices: see [architecture.md](architecture.md#decisions).

## Documents

| Doc | What's inside |
|-----|---------------|
| [architecture.md](architecture.md) | System diagram, folder layout, hosting constraints, auth, image uploads, environment variables |
| [data-model.md](data-model.md) | Every table, column and relationship |
| [api.md](api.md) | REST conventions and the endpoint list for each module |
| [setup.md](setup.md) | How to run everything locally (target state) |
| [roadmap.md](roadmap.md) | Milestones, the ordered issue list and the cutover plan |

## How to contribute

1. Read this README and [architecture.md](architecture.md) first.
2. Open [roadmap.md](roadmap.md) and pick an issue whose **dependencies are closed**. Work roughly in milestone order: M0 must land before the modules.
3. **Comment on the issue to claim it** before you start. A maintainer will assign you.
4. Create a branch named `<type>/<issue-number>-<short-name>`, e.g. `feat/12-events-api`.
5. Keep the PR focused on one issue. Include `Closes #<number>` in the PR description.
6. Each issue lists acceptance criteria. Your PR is ready when all of them are checked.
7. Follow the general contribution flow in the [root README](../../README.md#ways-to-contribute).

### Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/) with a scope, matching the existing history:

```
feat(events): add events CRUD endpoints
fix(blog): handle missing cover image
docs(cms): document R2 upload flow
```

Common scopes: `backend`, `frontend`, `admin`, `infra`, `org`, `events`, `blog`, `contact`, `projects`, `cms`.

### Labels

| Label | Meaning |
|-------|---------|
| `area:backend` / `area:frontend` / `area:admin` / `area:infra` | Which part of the codebase |
| `module:org` / `module:events` / `module:blog` / `module:contact` / `module:projects` | Which feature module |
| `good first issue` | Small and well-defined. Good for newcomers |
| `epic` | Tracking issue that links other issues |
