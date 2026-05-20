---
name: steerco-pack
description: Generate a standardised steering committee update pack (Word or PowerPoint) covering program scorecard, financials, initiative status, decisions required, risks, and next period plan for Ventia's cost-out program.
---

# Skill: steerco-pack

## When to invoke
- "steerco pack", "steerco update", "steering committee", "program update deck"
- "ExCo update", "CFO update pack", "monthly update", "board pack"
- When Jacob needs a structured program status report for senior stakeholders

---

## Step 1 — Gather inputs

Ask Jacob for the following (or pull from context if already provided):

**Required:**
- Reporting period (e.g. "March 2026", "Q3 FY26")
- Financial summary: banked, in-flight, pipeline values by lever (or confirm "pull from program-tracker")
- Active initiative list with status, owner, FY26 value, next milestone
- Decisions required (if any)
- Top risks or issues
- Next period commitments

**Auto-pull if available:**
- `4 - Projects/program-tracker/initiative_registry.md` — initiative list, status, values
- Any recent analysis outputs referenced in conversation

**If data is missing:** show "TBC" — never fabricate. Flag clearly as needing input.

**Output format:** Ask if not already stated.
- Default: Word doc (.docx) using python-docx
- If Jacob says "deck" or "slides": invoke pptx skill

---

## Step 2 — Confirm structure

Before generating, confirm with Jacob:
1. Which sections to include (all 6 by default)
2. Any initiatives with status changes since last update (flag these in Section 3)
3. Whether to mark as DRAFT or FINAL (default: DRAFT)

---

## Step 3 — Generate the pack

### Section 1 — Program Scorecard

One-page traffic-light summary. Use this table structure:

| Dimension | Status | Commentary |
|---|---|---|
| Overall Program | 🟢/🟡/🔴 | One sentence |
| FY26 Target ($100m) | 🟢/🟡/🔴 | Banked $X + In-flight $X = $X of $100m |
| Pipeline | 🟢/🟡/🔴 | N initiatives, $X total opportunity |
| Risks | 🟢/🟡/🔴 | Key risk in one sentence |
| Resourcing | 🟢/🟡/🔴 | Team capacity / blockers |

**Traffic light definitions:**
- 🟢 On track — no intervention needed
- 🟡 At risk — action underway, needs monitoring
- 🔴 Off track — escalation or decision required

**Hard rule:** If gap to $100m target is >40% with <6 months remaining in FY26, Overall Program status cannot be 🟢.

---

### Section 2 — Financial Summary

Table by lever:

| Category | FY26 Target | Banked | In-Flight (weighted) | Pipeline | Gap |
|---|---|---|---|---|---|
| Procurement | | | | | |
| Policy | | | | | |
| Workforce | | | | | |
| Operating Model | | | | | |
| **Total** | **$100m** | | | | |

**Definitions:**
- Banked = validated savings in actuals or contracted
- In-flight = weighted by confidence: High=100%, Medium=60%, Low=30%
- Pipeline = identified but not yet actioned
- Gap = Target − (Banked + In-flight weighted)

Include a brief narrative (2–3 sentences) on overall trajectory and key movement since last period.

If generating .docx: describe waterfall chart concept in a callout box — full chart rendering not available in python-docx.
If generating .pptx: include a waterfall chart (Target → Banked → In-flight → Pipeline → Gap).

---

### Section 3 — Initiative Status

Table of active initiatives, grouped: Banked first, then In-flight, then Pipeline.

| # | Initiative | Lever | Sector | Status | FY26 Value | Owner | Next Milestone | Risk |
|---|---|---|---|---|---|---|---|---|
| 1 | | | | | $X | | [action by date] | 🟢/🟡/🔴 |

**Status values:** Banked | In-flight (High) | In-flight (Medium) | In-flight (Low) | Pipeline | Blocked | On Hold

Flag any initiative where status has CHANGED since last update with a note: "(↑ upgraded)", "(↓ downgraded)", "(NEW)", "(BLOCKED)".

If no changes, note "No status changes since last update."

---

### Section 4 — Decisions Required

Table of genuine decisions only. Do not include FYIs.

| # | Decision | Context | Options | Recommendation | Required by |
|---|---|---|---|---|---|
| 1 | | | | | [specific date] |

**Rules:**
- Each decision must have a clear recommendation — take a position
- "Required by" must be a specific date, not "ASAP" or "TBC"
- If no decisions are pending, state: "No decisions required this period."

---

### Section 5 — Risks & Issues

Table of material risks and issues only. Maximum 6 rows. Split risks (future) from issues (current).

| # | Risk/Issue | Type | Impact | Likelihood | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|
| 1 | | Risk/Issue | H/M/L | H/M/L | | | Open/Mitigating/Closed |

If fewer than 3 items exist, that's fine — do not pad.

---

### Section 6 — Next Period Plan

Commitments Jacob and the team will deliver before the next steerco. Maximum 10 actions.

| # | Action | Owner | Due | Dependencies |
|---|---|---|---|---|
| 1 | | | | |

Keep actions specific and outcome-oriented (e.g. "Complete procurement deep-dive for FM category" not "Progress FM work").

---

## Step 4 — Generate output file

### Word (.docx) — default

Use python-docx via inline heredoc. Activate venv first:

```bash
source /Users/jacob/Documents/The-Analyst/.venv/bin/activate && python3 - << 'EOF'
# python-docx script here
EOF
```

**Document structure:**
- Cover page: Ventia logo (`Template/ventia_logo.png`), report title, reporting period, DRAFT/FINAL watermark
- Each section on its own page with a Navy (`#0B3254`) section header
- Tables use alternating row shading (white / light grey `#F5F5F5`), header row in Navy with white text
- Font: Arial (fallback for Source Sans Pro), body 10pt, headings 12pt bold
- Currency: AUD, formatted as `$#,##0` (no decimals)

**Save to:** `4 - Projects/program-tracker/[YYMMDD]_Steerco_Pack.docx`

If `4 - Projects/program-tracker/` does not exist, create it.

### PowerPoint (.pptx) — if Jacob requests "deck" or "slides"

Invoke the `pptx` skill. Pass all six sections as structured content. Apply Ventia brand colours.

**Save to:** `4 - Projects/program-tracker/[YYMMDD]_Steerco_Pack.pptx`

---

## Step 5 — Log and confirm

Append a dated entry to `4 - Projects/program-tracker/log.md` (create if not exists):

```
## Steerco Pack — [YYYY-MM-DD]
- Reporting period: [period]
- Sections included: [list]
- Output: [file path]
- Data gaps / TBCs: [list any missing fields]
- Status changes flagged: [list or "none"]
```

Confirm to Jacob: file path, any TBC fields that need filling before distribution, and whether DRAFT stamp is applied.

---

## Ventia context (always apply)

- Company: Ventia Infrastructure Services (ASX:VNT)
- Sectors: D&SI, Telco, Transport, Infrastructure Services
- Cost program: $100m FY26 / $300m 3-year target
- Levers: procurement, policy, workforce, operating model
- Audience: ExCo, CFO, sector leadership
- All figures AUD unless stated

## Quality rules

- Never fabricate numbers — missing data = "TBC", not a guess
- Traffic lights must be justified in the commentary column
- Decisions section must take positions — "we recommend Option A because..."
- Pack must be readable in 5 minutes by a time-poor executive
- No padding, no filler, no AI-sounding language
- Tone: direct, professional — as if briefing a project director over coffee

---

## Wiki Compile (post-delivery)

After delivering the output, compile durable findings to the Knowledge Wiki. Read `context/wiki-compile-step.md` for the full checklist. Skip if the output is formatting-only or contains no new findings (apply the "so what" test).
