---
description: Pre-output gate for senior-audience deliverables. Auto-fire ONLY when producing a decision brief, one-pager, conversation prep, exec summary, or "support asks" document bound for a named GM, CFO, Sector Exec, ExCo, or external client (DIT, Telstra, Defence, NBN, etc.). Forces routing through the c-level thinker council before any write-up. Refuses to produce final output without classifying audience, loading thinker files, and running council critique. SKIP for routine wiki edits, internal team docs, status updates, or any deliverable not bound to a named senior audience.
allowed-tools: Read, Write, Edit, Bash, Agent, AskUserQuestion
---

# /clevel-review

Pre-output gate. Three phases. Hard enforcement: do NOT skip to Phase 3.

Canonical spec: `/Users/jacob/Documents/The-Analyst/6 - slash commands/clevel-review.md`

## Phase 1: Classify and self-validate the council

### Required inputs

Ask the user (via AskUserQuestion if any are missing):

- **Deliverable type** — decision brief / status / risk / category strategy / contract change / conversation prep / one-pager / steerco pack / external client doc
- **Audience** — named person + role (e.g. "Group GM Supply Chain"; "CFO"; "client contact at DIT")
- **Format** — 1-page Obsidian markdown / Word docx / PPTX deck / dashboard / email
- **Ask type** — support / approval / information / decision / endorsement
- **Source material** — brief, draft, wiki path, prior outputs (if any)

### Routing

1. Read `/Users/jacob/Documents/The-Analyst/CLAUDE.md` "Orchestrator — Routing Logic" section (lines covering thinker triggers).
2. Match the inputs above to thinker triggers. Multi-signal tasks load multiple thinkers.
3. Read each matched thinker file from `/Users/jacob/Documents/The-Analyst/context/<thinker>.md`.

Mandatory thinker triggers (not exhaustive, see CLAUDE.md routing table for full):

| Signal | Thinker file(s) |
|---|---|
| Initiative sizing / "should we do this" | `cso.md` |
| Financial claim / one-pager / CFO summary | `cfo.md` |
| Named client (AGFMA, Telstra, Defence, NBN, state transport) | `chief-client-officer.md` + `general-counsel.md` |
| Category, vendor, panel, supplier consolidation | `cpo.md` + `coo.md` |
| System / data / Databricks / SAP dependency | `cio.md` + `data-landscape.md` |
| Contract terms, EA, legal feasibility | `general-counsel.md` + `cro.md` |
| Workforce, leave, restructure | `chief-people-officer.md` + `general-counsel.md` |
| Risk, insurance, WHS, regulatory | `cro.md` |
| Operational feasibility, change management | `coo.md` + `ventia-delivery-difficulties.md` |
| Cost modelling, inflation, market rates | `chief-economist.md` |
| Visual deliverable (deck, dashboard, web) | `cdo.md` |
| Steerco / ExCo update | `cso.md` + `cfo.md` |

### Phase 1 output (write to user)

```
## Classification
| Field | Value |
|---|---|
| Deliverable type | … |
| Audience | … |
| Format | … |
| Ask type | … |

## Council loaded
| Thinker | Why loaded | File read |
|---|---|---|
| … | … | ✓ |
```

**Stop.** Ask user to confirm before Phase 2: "Council looks right? Add or remove any thinker before I run critique."

## Phase 2: Council critique

For each loaded thinker, produce critique IN THAT THINKER'S VOICE using:
- The thinker's "Questions This Thinker Always Asks" (apply to the draft / proposal)
- The thinker's "Anti-Patterns This Thinker Catches" (red-flag scan)
- The thinker's "Ventia Context" (relevance check)

### Output format

```
## Council critique

### [Role] (file: [thinker].md)

**Voice:** [1-2 sentences framing what this thinker brings]

**Challenges raised:**
- [Specific challenge tied to the draft / proposal]
- …

**Anti-patterns flagged:**
- [Specific pattern in the draft this thinker catches]

**Yes if:**
- [What would need to change for this thinker to support]

---

[Repeat per thinker]

## Consolidated MECE issues
| # | Issue | Raised by | Severity | Resolution |
|---|---|---|---|---|
| 1 | … | … | high/med/low | … |
```

**Stop.** Ask user to confirm or push back on any critique before Phase 3.

## Phase 3: Audience-shaped write-up

Format selected from classification, NOT from topic.

### Format library (v1)

| Audience | Format | Skill to call |
|---|---|---|
| GM / Sector exec | 1-page Obsidian markdown | (this skill, GM template below) |
| CFO | 1-page markdown + optional Word | `program-exec-summary` |
| ExCo / Steerco | PPTX | `program-steerco-pack` |
| External client | Word doc | `analysis-commercial-insight` |

**v1 ships GM-only.** For CFO / ExCo / External, run Phase 1 + 2 then hand off to the named skill with the consolidated issue list.

**Auto-chain:** after Phase 3 produces the draft, automatically invoke `/exec-comms` to apply visual + structural format discipline (callouts, parallel tables, bold-the-punchline, banned-word scan, length cap to audience tier). The chain is mandatory, not optional. `/exec-comms` enforces the format rules; `/clevel-review` produces the content.

### GM 1-page template (mandatory structure)

```
# [Title]

> Audience: [named person] | Read time: [N] min | Date: [YYYY-MM-DD]

## Decision sought
[1 sentence. The single thing this page asks for.]

## Situation
- [3-4 MECE bullets. Where we are.]

## Complication
- [3-4 MECE bullets. Why current state cannot deliver alone.]

## Asks (parallel)
| # | Ask | Who carries if approved | Effort | Outcome |
|---|---|---|---|---|

## What we commit in return
- [3 bullets. Reciprocal commitment.]

## What's at stake by [date]
- [2 bullets. Cost of inaction, anchored to a real deadline.]

## Appendix
[Links only. No narrative.]
```

### Banned patterns (refuse to ship if any present)

- "What this is NOT" sections (defensive, undermines confidence)
- "Pre-empted Questions" sections (if asked, answer; don't pre-litigate)
- Mixed tactical / structural detail in same section (force separate buckets)
- Asks of different shapes (parallel structure mandatory)
- Value tables before the ask (lead with the answer, not the proof)
- Headlines without urgency markers (anchor to deadline)

## Safety / failure modes

- **Thinker file missing**: warn, list missing thinker, proceed with degraded council, flag in output.
- **User wants to skip Phase 2**: warn that this defeats the gate; require explicit `--skip-critique` flag from user; log the skip in the output deliverable.
- **Audience unknown**: ASK via AskUserQuestion. Do not guess.
- **Multiple audiences**: default to most senior; flag secondary as constraint.
- **Conflict between thinkers**: surface to user as decision point. Do not auto-resolve.

## Logging

Optional. If user passes `--log <path>`, write the Phase 1 + 2 outputs as a markdown file at that path alongside the deliverable. Default: no log.

## Reference

- Spec: `/Users/jacob/Documents/The-Analyst/6 - slash commands/clevel-review.md`
- Routing logic: `/Users/jacob/Documents/The-Analyst/CLAUDE.md` (Orchestrator section)
- Thinker files: `/Users/jacob/Documents/The-Analyst/context/*.md`
- Output skills: `program-exec-summary`, `program-steerco-pack`, `analysis-commercial-insight`
