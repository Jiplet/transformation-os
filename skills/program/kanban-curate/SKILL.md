---
name: kanban-curate
description: Hygiene pass over the wiki/0-Kanban/ — validate card frontmatter, find missing due dates, flag stale cards (>14 days without last_session), surface malformed sector tags. Use when Jacob says "curate kanban", "tidy the cards", "kanban hygiene", "/kanban-curate", or when /weekly-review needs hygiene findings.
---

# Skill: kanban-curate

## What this does

Runs a single-pass hygiene audit over all kanban files. Default mode is read-only: produces a structured findings report, proposes fixes, does not mutate. Mutations apply only on explicit approval ("apply all" / "fix that one").

When invoked from `weekly-review`, return findings as a structured list and let `weekly-review` roll them into its diff.

---

## Scope

Read all files under `1 - Knowledge/wiki/0-Kanban/` in a single pass (~30 cards expected, no pagination):
- `master.md` (board state)
- `boards/*.md` (per-initiative boards)
- `cards/*.md` (all `CLT-NN-*.md` tickets and `INIT-*.md` initiatives)

---

## Checks

Run all six checks on every card. Each finding cites the filename and the specific field or value.

**1. Frontmatter completeness**
Every card must have `status`, `tags`, and either `owner` or a flag. Flag any card missing one or more of these three fields.

**2. Status validity**
`status` must be exactly one of: `Backlog`, `In Progress`, `Review`, `Done`, `Archive`. Flag any other value (including case variants, extra spaces, blank).

**3. Sector tag presence**
Every `CLT-NN-*` card must have exactly one tag matching `sector/<x>` where `<x>` is one of `telco`, `transport`, `dsi`, `infra`, `group`. Flag: missing sector tag, duplicate sector tags, or invalid sector value. `INIT-*` cards are exempt from this check (they carry sector tags in `master.md`).

**4. Missing due dates**
Cards with `status: In Progress` or `status: Review` that have no `due` field, or where `due` is blank/null. Flag each.

**5. Stale cards**
Cards where `last_session` is more than 14 days before today AND `status` is not `Done` or `Archive`. Flag each with the calculated days-since-session.

**6. Orphan cards**
Card files on disk not referenced by `master.md` or any `boards/*.md` file. Flag each orphan by filename.

**Bonus check — tag formatting**
Any tag that is not lowercase kebab-case (per `1 - Knowledge/CLAUDE.md` tag taxonomy). Flag the card and the malformed tag.

---

## Report format

Group findings under these headings. If a group has no findings, omit it.

```
## Frontmatter issues
- cards/CLT-NN-foo.md — missing field: owner

## Missing fields
- cards/CLT-NN-foo.md — no due date (status: In Progress)

## Stale cards
- cards/CLT-NN-foo.md — last_session: 2026-03-01 (47 days ago, status: In Progress)

## Tag fixes needed
- cards/CLT-NN-foo.md — no sector tag found
- cards/CLT-NN-bar.md — sector/Telco (should be sector/telco)

## Orphans
- cards/CLT-99-old-thing.md — not referenced in master.md or any board
```

End with a one-line summary: "N issues across M cards."

---

## Mutation rules

Default: read-only. Suggest fixes only.

On explicit approval:
- "apply all" — apply every proposed fix
- "fix that one" / "fix [card name]" — apply only the named fix

For each mutation: edit the card frontmatter field in place. Do not touch any field not named in the approved fix. After applying, confirm: "Fixed N fields across M cards."

When invoked from `weekly-review`: skip the report output, return findings as a plain structured list for `weekly-review` to include in its diff. Do not prompt for approval — that is `weekly-review`'s responsibility.
