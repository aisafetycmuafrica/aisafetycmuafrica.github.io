# Data Model (MySQL 8)

All tables use `utf8mb4`, InnoDB and the conventions below. Field lists are the **starting point**. A change goes through an Alembic migration and an update to this doc in the same PR.

## Conventions (every table unless noted)

| Column | Type | Notes |
|--------|------|-------|
| `id` | `BIGINT UNSIGNED` PK, auto-increment | |
| `created_at` | `DATETIME(6)` | UTC, default now |
| `updated_at` | `DATETIME(6)` | UTC, updated on change |

- **Slugs:** `VARCHAR(160)`, unique, lowercase and kebab-case. Generated from the title and editable.
- **Long text:** Markdown bodies use `MEDIUMTEXT`.
- **Images:** referenced by `*_media_id` foreign keys to `media.id` (`ON DELETE SET NULL`).
- **Publishing:**
  - `status` is `ENUM('draft','published')`.
  - `published_at` is `DATETIME(6)` and NULL until the item is published.
  - Public endpoints return only `published` rows.
- **Ordering:** `sort_order INT DEFAULT 0` wherever admins hand-arrange lists.

## Entity relationships

```
users

organization_profile (single row) ──< social_links
team_members ──┬──< post_authors >── posts ──< post_tags >── tags
               └──< project_members >── projects ──< project_tags >── tags
programs
events ──< event_speakers
contact_messages
media  ◄── referenced by org logo, team photos, programs, events, speakers, posts, projects
```

---

## Core

### `users`

| Column | Type | Notes |
|--------|------|-------|
| `email` | `VARCHAR(255)` unique | login |
| `full_name` | `VARCHAR(120)` | |
| `password_hash` | `VARCHAR(255)` | argon2 |
| `role` | `ENUM('admin','editor')` | |
| `is_active` | `BOOL` default true | |
| `last_login_at` | `DATETIME(6)` NULL | |

### `media`

| Column | Type | Notes |
|--------|------|-------|
| `key` | `VARCHAR(255)` unique | R2 object key |
| `url` | `VARCHAR(500)` | `R2_PUBLIC_BASE_URL` + key |
| `content_type` | `VARCHAR(80)` | |
| `size_bytes` | `INT` | |
| `width` / `height` | `INT` NULL | |
| `alt_text` | `VARCHAR(255)` | required for accessibility |
| `uploaded_by_id` | FK `users.id` NULL | |

Deleting a media row also deletes the R2 object. If the media is still referenced, the API returns `409`.

---

## Module: Organization profile

### `organization_profile` (exactly one row, `id = 1`)

| Column | Type | Notes |
|--------|------|-------|
| `name` | `VARCHAR(120)` | "ASICA" |
| `full_name` | `VARCHAR(255)` | "AI Safety Initiative at CMU-Africa" |
| `tagline` | `VARCHAR(255)` | hero line on Home |
| `mission` | `TEXT` | Markdown |
| `about` | `MEDIUMTEXT` | Markdown, the About page body |
| `contact_email` | `VARCHAR(255)` | shown in the footer, receives contact notifications |
| `location` | `VARCHAR(255)` | "Kigali, Rwanda" |
| `logo_media_id` | FK `media` NULL | |
| `seo_description` | `VARCHAR(300)` | default meta description |

### `social_links`

| Column | Type | Notes |
|--------|------|-------|
| `platform` | `VARCHAR(40)` | `linkedin`, `github`, `x`, `website`… |
| `url` | `VARCHAR(500)` | |
| `sort_order` | `INT` | |

### `team_members`

| Column | Type | Notes |
|--------|------|-------|
| `name` | `VARCHAR(120)` | e.g. "Position Open" for vacancies |
| `role` | `VARCHAR(120)` | "Director", "Alignment Track Lead" |
| `group` | `ENUM('core','faculty','advisor','alumni')` | sections on the Team/About pages |
| `bio` | `TEXT` | |
| `photo_media_id` | FK `media` NULL | |
| `linkedin_url` / `github_url` / `website_url` | `VARCHAR(500)` NULL | |
| `is_open_position` | `BOOL` | renders the "Position Open" style |
| `is_visible` | `BOOL` default true | |
| `sort_order` | `INT` | |

### `programs`

Matches the current `programs/*.html` pages.

| Column | Type | Notes |
|--------|------|-------|
| `title` | `VARCHAR(160)` | "AI Alignment Fundamentals" |
| `slug` | unique | |
| `level` | `VARCHAR(60)` | "Fundamentals", "Post-Fundamentals", "Invite-only", "Ongoing"… |
| `status_label` | `VARCHAR(60)` | "Open", "Coming Soon", "Paused"… |
| `status_tone` | `ENUM('open','upcoming','closed')` | maps to `.status--*` CSS classes |
| `summary` | `VARCHAR(300)` | card text |
| `body` | `MEDIUMTEXT` | Markdown |
| `apply_url` | `VARCHAR(500)` NULL | e.g. Airtable form |
| `cover_media_id` | FK `media` NULL | |
| `sort_order` | `INT` | |
| `status` / `published_at` | | publishing |

---

## Module: Events

### `events`

| Column | Type | Notes |
|--------|------|-------|
| `title` | `VARCHAR(200)` | |
| `slug` | unique | |
| `type` | `ENUM('talk','workshop','hackathon','deadline','social','other')` | |
| `summary` | `VARCHAR(300)` | card text |
| `body` | `MEDIUMTEXT` | Markdown |
| `starts_at` | `DATETIME(6)` NULL | used for sorting and the upcoming/past split |
| `ends_at` | `DATETIME(6)` NULL | |
| `date_label` | `VARCHAR(60)` NULL | free text that overrides the formatted date, e.g. "Week 6", "Weeks 1 to 2" |
| `location` | `VARCHAR(255)` NULL | room or "Online" |
| `online_url` | `VARCHAR(500)` NULL | |
| `registration_url` | `VARCHAR(500)` NULL | |
| `status_override` | `ENUM('open','closed','cancelled')` NULL | if NULL, status comes from the dates (upcoming/past) |
| `cover_media_id` | FK `media` NULL | |
| `program_id` | FK `programs` NULL | optional link, e.g. a hackathon event → Hackathon program |
| `status` / `published_at` | | publishing |

### `event_speakers`

| Column | Type | Notes |
|--------|------|-------|
| `event_id` | FK `events` `ON DELETE CASCADE` | |
| `name` | `VARCHAR(120)` | |
| `title` | `VARCHAR(200)` | role / affiliation |
| `bio` | `TEXT` NULL | |
| `photo_media_id` | FK `media` NULL | |
| `link_url` | `VARCHAR(500)` NULL | |
| `sort_order` | `INT` | |

---

## Module: Blog

### `posts`

| Column | Type | Notes |
|--------|------|-------|
| `title` | `VARCHAR(200)` | |
| `slug` | unique | keep the existing slugs, e.g. `week-3-training-safer-ai-models` |
| `excerpt` | `VARCHAR(400)` | card text and meta description |
| `body` | `MEDIUMTEXT` | Markdown |
| `cover_media_id` | FK `media` NULL | |
| `reading_minutes` | `SMALLINT` | computed on save |
| `status` / `published_at` | | `published_at` is the displayed date |
| `created_by_id` | FK `users` NULL | |

### `post_authors` (many-to-many)

`post_id` FK `ON DELETE CASCADE`, `team_member_id` FK, `sort_order`. Primary key is (`post_id`, `team_member_id`).

### `tags` / `post_tags` / `project_tags`

`tags`: `name VARCHAR(60)` unique, `slug` unique.

`post_tags` and `project_tags` are join tables with composite primary keys.

---

## Module: Contact

### `contact_messages`

| Column | Type | Notes |
|--------|------|-------|
| `name` | `VARCHAR(120)` | |
| `email` | `VARCHAR(255)` | |
| `subject` | `VARCHAR(200)` | |
| `category` | `ENUM('general','partnership','speaking','press','other')` | |
| `message` | `TEXT` | max 5,000 chars |
| `status` | `ENUM('new','read','replied','archived')` default `new` | |
| `internal_note` | `TEXT` NULL | only visible to staff |
| `handled_by_id` | FK `users` NULL | |
| `ip_hash` | `CHAR(64)` | SHA-256 of IP + secret, for rate limiting and abuse. Raw IPs are never stored |
| `user_agent` | `VARCHAR(255)` | |

No `updated_at` trigger is needed beyond the convention. Messages are never edited, only their status and note change.

---

## Module: Projects

### `projects`

| Column | Type | Notes |
|--------|------|-------|
| `title` | `VARCHAR(200)` | |
| `slug` | unique | |
| `summary` | `VARCHAR(300)` | |
| `body` | `MEDIUMTEXT` | Markdown |
| `project_status` | `ENUM('planned','active','completed','archived')` | |
| `kind` | `ENUM('research','hackathon','capstone','tooling','other')` | |
| `repo_url` / `paper_url` / `demo_url` | `VARCHAR(500)` NULL | |
| `cover_media_id` | FK `media` NULL | |
| `is_featured` | `BOOL` | shown on Home |
| `started_on` / `ended_on` | `DATE` NULL | |
| `status` / `published_at` | | publishing |

### `project_members`

`project_id` FK `ON DELETE CASCADE`, `team_member_id` FK NULL, `external_name VARCHAR(120)` NULL (for members who aren't on the team list), `role VARCHAR(80)`, `sort_order`. Either `team_member_id` or `external_name` must be set.
