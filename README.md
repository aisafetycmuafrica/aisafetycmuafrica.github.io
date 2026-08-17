# ASICA

**AI Safety Initiative at CMU Africa**

Public site for ASICA, a student-led research and education initiative at Carnegie Mellon University Africa. Piloting Fall 2026 under the CMU Africa Research Club.

## Mission

AI capabilities are advancing faster than our ability to evaluate, align, or govern them. ASICA brings together researchers, engineers, and policy thinkers to build the technical and governance tools that let us evaluate systems before deployment, not after.

We aim for a self-sustaining research community that produces real technical outputs, capstones, hackathon submissions, papers, not just awareness. Success means reducing catastrophic risk of AI before deployment, and giving members a clear next step into fellowships or research roles.

## Programs

Start with Fundamentals; a research pipeline opens as you go further.

| Program | Level |
|---------|--------|
| [AI Alignment Fundamentals](programs/alignment-fundamentals.html) | Fundamentals |
| [Research Fellowship](programs/research-fellowship.html) | Post-Fundamentals |
| [Research Scholars](programs/research-scholars.html) | Invite-only |
| [AI Safety Seminar](programs/seminar.html) | Ongoing |
| [Hackathon](programs/hackathon.html) | Once a semester |

Work spans research (evaluations, red-teaming, alignment), education (Fundamentals → capstone), and events (Seminar + hackathon).

## What students gain

- **Technical literacy**: structured grounding in alignment, not just exposure
- **Real research experience**: mentored path from reading group to independent and faculty-mentored work
- **Career pathways**: routes into programs like MATS, SPAR, Apart Research sprints, BlueDot AGISF, and GovAI-style fellowships

## Ways to contribute

This site is plain HTML/CSS/JS. Contributions of all sizes are welcome.

1. **Open an issue**: report a bug, suggest a copy fix, or propose a page improvement on GitHub Issues.
2. **Pick up an issue**: comment on an open issue to claim it before you start.
3. **Clone the repo**: fork (if needed), then clone your copy locally.
4. **Fix the bug / make the change**: edit the relevant HTML, CSS, or JS; keep changes focused.
5. **Open a pull request**: push your branch and open a PR describing what you changed and why.
6. **Wait for review**: a maintainer will review; address feedback if requested, then the PR can be merged.

## Setup

No build step. From the repo root, serve the folder with any static server:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Open `http://localhost:8000`.

**Deploy:** push to GitHub → Settings → Pages → source `main` / root. Relative links work the same locally and on Pages (or any other static host).
