# ASICA site

Multi-page static site — plain HTML/CSS/JS, no build step. Structure mirrors how CASI (CMU)
and AISI (Georgia Tech) organize their own sites: a short home page, dedicated pages for
About / Team / Events / Get Involved, and a separate page per program under `programs/`.

## Structure

```
index.html                              home
about.html                              mission, "what ASICA stands for", what members gain
team.html                               org structure + open roles
events.html                             semester calendar + upcoming events
get-involved.html                       application forms + mailing list
programs/
  alignment-fundamentals.html
  governance-fundamentals.html
  research-fellowship.html
  research-scholars.html
  seminar.html
  hackathon.html
assets/style.css                        shared design system
assets/script.js                        nav + tabs behavior
```

Nav: "Join Community" (far left) → About / Programs (dropdown) / Get Involved / Team / Events
(centered) → ASICA wordmark (far right). Same nav and footer appear on every page.

## 1. Connect your Airtable forms (required before launch)

In `get-involved.html`, search for `REPLACE_WITH` — three placeholders:

1. `REPLACE_WITH_TRACK_FORM_ID` — Semester Track application
2. `REPLACE_WITH_CORE_FORM_ID` — Core Membership application
3. `REPLACE_WITH_NEWSLETTER_FORM_ID` — email subscription

Get each real URL from Airtable: open the form's table → **Form** view → **Share form** →
**Embed**, then copy the `src="https://airtable.com/embed/..."` URL into the matching spot.

Optional: `events.html` has a commented-out slot for a live Google Calendar embed, the same
way AISI (Georgia Tech) does it on their site. Uncomment and fill in if you want that.

## 2. Deploy

**GitHub Pages:** push this whole folder to a repo → Settings → Pages → source: `main` / root.
Because every internal link is a relative path, the site works the same on GitHub Pages or
opened locally.

**Lovable:** import the folder into a new static project — no framework needed.

## 3. Before going public

- Swap `mailto:hello@asica.example` (in every page's footer) for your real email
- Team page has placeholder role cards with no names — fill in as roles are actually filled
- Update the "Piloting Fall 2026 under the CMU Africa Research Club" line once that changes
