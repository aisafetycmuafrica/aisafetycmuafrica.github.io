# API Reference (v1)

The base URL is `/api/v1`. FastAPI serves interactive docs at `/docs` (Swagger) and `/redoc`, and the OpenAPI JSON is the authoritative contract. This page covers the conventions and the planned endpoints.

## Conventions

- **JSON only.** Field names are `snake_case`. Datetimes are ISO-8601 in UTC (`2026-10-24T14:00:00Z`).
- **Public endpoints** (`/api/v1/...`) are read-only (except contact submission), return only published content, and need no auth.
- **Admin endpoints** (`/api/v1/admin/...`) need `Authorization: Bearer <jwt>` and return drafts too.
- **Identifiers.** Public detail routes use the **slug**. Admin routes use the numeric **id**.
- **Updates.** `PATCH` is a partial update. `PUT` is used only for the singleton organization profile.
- **Images.** Writes accept `*_media_id`. Reads embed `{ id, url, alt_text, width, height }`.

### Pagination

List endpoints accept `?page=1&limit=20` (max `limit` 100) and return:

```json
{
  "items": [ ... ],
  "page": 1,
  "limit": 20,
  "total": 42
}
```

### Errors

Every error uses one shape:

```json
{
  "error": {
    "code": "not_found",
    "message": "Event not found",
    "details": null
  }
}
```

| HTTP | `code` | When |
|------|--------|------|
| 400 | `bad_request` | malformed input |
| 401 | `unauthorized` | missing or invalid token |
| 403 | `forbidden` | role not allowed |
| 404 | `not_found` | |
| 409 | `conflict` | duplicate slug, media still in use |
| 422 | `validation_error` | Pydantic errors (`details` lists the fields) |
| 429 | `rate_limited` | contact form |
| 500 | `internal_error` | |

## Auth

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | public | `{ email, password }` → `{ access_token, token_type, expires_in, user }` |
| GET | `/auth/me` | any | current user |
| POST | `/auth/change-password` | any | `{ current_password, new_password }` |
| GET / POST | `/admin/users` | admin | list / invite (create) users |
| PATCH / DELETE | `/admin/users/{id}` | admin | change role, deactivate |

## Health

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/health` | public | `{ status: "ok", db: "ok" }` |

## Media

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/admin/media/presign` | editor | `{ filename, content_type, size }` → `{ upload_url, key, public_url, expires_in }` |
| POST | `/admin/media` | editor | `{ key, alt_text, width?, height? }` registers the uploaded object |
| GET | `/admin/media` | editor | paginated library |
| PATCH | `/admin/media/{id}` | editor | update `alt_text` |
| DELETE | `/admin/media/{id}` | admin | `409` if referenced |

## Organization profile

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/organization` | public | profile + social links |
| PUT | `/admin/organization` | admin | replace profile fields |
| GET | `/team` | public | visible members grouped by `group`, sorted |
| GET / POST | `/admin/team` | editor | list / create |
| GET / PATCH / DELETE | `/admin/team/{id}` | editor (DELETE: admin) | |
| PATCH | `/admin/team/reorder` | editor | `[{ id, sort_order }]` |
| GET | `/programs` | public | published programs |
| GET | `/programs/{slug}` | public | |
| GET / POST | `/admin/programs` | editor | |
| GET / PATCH / DELETE | `/admin/programs/{id}` | editor (DELETE: admin) | |

## Events

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/events?when=upcoming\|past\|all&type=` | public | upcoming sorted ascending, past sorted descending; each item has a computed `display_status` |
| GET | `/events/{slug}` | public | includes `speakers` |
| GET / POST | `/admin/events` | editor | `?status=draft\|published` |
| GET / PATCH / DELETE | `/admin/events/{id}` | editor (DELETE: admin) | |
| POST | `/admin/events/{id}/publish` / `unpublish` | editor | |
| POST | `/admin/events/{id}/speakers` | editor | add speaker |
| PATCH / DELETE | `/admin/events/{id}/speakers/{speaker_id}` | editor | |

`display_status` uses `status_override` when it is set. Otherwise it's `upcoming` if `starts_at` is in the future (or NULL) and `past` if not.

## Blog

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/posts?tag=&page=` | public | newest first, by `published_at` |
| GET | `/posts/{slug}` | public | includes `authors`, `tags`, `prev`/`next` slugs |
| GET | `/tags` | public | tags with post counts |
| GET / POST | `/admin/posts` | editor | `authors: [team_member_id]`, `tags: ["name"]` (unknown tags are created) |
| GET / PATCH / DELETE | `/admin/posts/{id}` | editor (DELETE: admin) | |
| POST | `/admin/posts/{id}/publish` / `unpublish` | editor | publishing sets `published_at` if empty |

## Contact

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/contact` | public | `{ name, email, subject, category, message, turnstile_token, website }` → `202 { ok: true }` |
| GET | `/admin/contact?status=` | editor | inbox, newest first |
| GET | `/admin/contact/{id}` | editor | |
| PATCH | `/admin/contact/{id}` | editor | `{ status?, internal_note? }` |
| DELETE | `/admin/contact/{id}` | admin | |
| GET | `/admin/contact/stats` | editor | counts per status (for the sidebar badge) |

**Spam protection on `POST /contact`:**

1. **Honeypot.** `website` must be empty. If it's filled, return `202` silently and don't store anything.
2. **Turnstile.** Verify the token with Cloudflare `siteverify`.
3. **Rate limit.** At most 5 submissions per `ip_hash` per hour, enforced with a DB count query (no Redis needed).
4. **Validation.** Length limits and a valid email format.

## Projects

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/projects?status=&kind=&featured=` | public | |
| GET | `/projects/{slug}` | public | includes `members`, `tags` |
| GET / POST | `/admin/projects` | editor | |
| GET / PATCH / DELETE | `/admin/projects/{id}` | editor (DELETE: admin) | |
| POST | `/admin/projects/{id}/publish` / `unpublish` | editor | |
