---
name: weekly-review
description: Walk Jacob through the Friday retro or Sunday week-ahead draft at wiki/2-Weekly/, present the proposed kanban diff, apply atomically on approval, and lock the file. Use when Jacob types /weekly-review or asks to "do the Friday review", "Sunday planning", "weekly review", "walk through the weekly draft".
---

# Skill: weekly-review

## What this does

Walks Jacob through a Friday retro or Sunday week-ahead draft, presents a single consolidated kanban diff, applies changes atomically on approval, and locks the weekly file. Called Friday 7am AEDT (retro) and Sunday 8pm AEDT (week-ahead), or any time Jacob types `/weekly-review`.

---

## Step 1: Locate the draft

Scan `1 - Knowledge/wiki/2-Weekly/` for files where frontmatter `status: draft`. Sort by `created` descending; take the most recent. The `flavour` field is either `friday` or `sunday`.

If no draft exists: read all daily logs in `1 - Knowledge/wiki/1-Daily/` for the current ISO week plus all cards in `1 - Knowledge/wiki/0-Kanban/cards/`, then generate a draft file following the `_template-friday.md` or `_template-sunday.md` schema (choose by day of week; Friday = retro, Sunday = week-ahead). Write the draft file, then proceed.

---

## Step 2: Pre-flight read

Before presenting anything, read every file the draft references:
- All `[[CLT-NN-*]]` and `[[INIT-*]]` cards linked in the draft
- All daily logs for the ISO week (`wiki/1-Daily/YYYY-MM-DD.md`)
- `wiki/0-Kanban/master.md`

Do not present any claim you have not grounded in a file you have actually read this session.

---

## Step 3: Invoke `kanban-curate`

Call the `kanban-curate` skill before walking through the draft. Receive its structured findings list (read-only mode). Hold these for inclusion in the diff in Step 4.

---

## Step 4: Walk through the draft — section by section

Present each section, pause, and wait for Jacob's edits before moving on. Do not batch all sections at once.

**Friday flavour (retro):**
1. Sessions this week (daily-log roll-up) — read aloud, pause for edits
2. Decisions made — read, pause
3. Due / overdue items — read, pause
4. Open threads — read, pause
5. Proposed kanban diff (see Step 5)

**Sunday flavour (week-ahead):**
1. Top 3 priorities — propose from kanban + last week's open threads, pause for Jacob's refinement
2. Cards landing this week (grouped by sector: telco / transport / dsi / infra / group) — read, pause
3. Risks / blockers — read, pause
4. Standing items — read, pause
5. Proposed kanban diff (see Step 5)

---

## Step 5: Proposed kanban diff

Present one consolidated diff list, grouped in this order. Include curate findings (Step 3) as additions.

```
### Status moves
- cards/CLT-NN-foo.md — status: In Progress -> status: Review

### Due-date changes
- cards/CLT-NN-foo.md — set due: YYYY-MM-DD (was unset)

### Tag fixes
- cards/CLT-NN-foo.md — add sector/telco (was missing)

### New cards
- cards/CLT-NN-foo.md — title, parent_initiative, status: Backlog

### Hygiene (from kanban-curate)
- cards/CLT-NN-foo.md — [finding from curate]
```

Wait for explicit approval before touching any file.

---

## Step 6: Atomic apply

When Jacob approves the diff (full or partial):
- Apply ALL approved changes in one pass: edit card frontmatter fields directly
- If a status change moves a card between columns, update `master.md` accordingly (move the `- [ ] [[...]]` entry to the correct column)
- After all changes applied, update the weekly file frontmatter: set `status: locked` and add `locked: <ISO datetime>`

Confirm with a count: "Applied N changes to M cards. Weekly file locked."

If Jacob rejects part of the diff, apply only the approved subset. Restate the final count accurately.

---

## Conventions

**Card frontmatter fields** (do not invent new ones): `id`, `title`, `type`, `status`, `project`, `sector`, `parent_initiative`, `owner`, `raised`, `last_session`, `due`, `output`, `plan`, `tags`

**Valid status values** (must match `master.md` columns exactly): `Backlog`, `In Progress`, `Review`, `Done`, `Archive`

**Valid sector tags**: `sector/telco`, `sector/transport`, `sector/dsi`, `sector/infra`, `sector/group` — exactly one per CLT card

**Tag format**: lowercase, kebab-case only (per `1 - Knowledge/CLAUDE.md` tag taxonomy)

**master.md column format**: `- [ ] [[INIT-slug]] #sector/x` (Backlog / In Progress / Review / Done) or `- [x] [[INIT-slug]] #sector/x` (Archive)

---

## Tone

Jacob is Head of Transformation. Lead with the so-what. No preamble. Concise, executive-ready. Take positions. Flag decisions that need his judgment; do not make them silently. Match the voice in `/Users/jacob/Documents/The-Analyst/CLAUDE.md`.
