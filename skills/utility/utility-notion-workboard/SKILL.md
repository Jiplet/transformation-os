---
name: notion-workboard
description: Push completed work to Jacob's Notion Work Board kanban. Use this skill when Jacob says "push to notion", "add to kanban", "log in notion", "send to work board", or similar. Also triggers automatically at the end of any session where a major deliverable was produced (Word doc, Excel workbook, PPTX, SQL, analysis output) — Claude should proactively ask "Want me to log this in Notion?" before closing out. If Jacob says yes (or just "yes", "do it", "go ahead"), invoke this skill immediately.
---

# Notion Work Board — Push Skill

## What this does

Creates or updates a ticket on Jacob's Notion Work Board kanban so work is tracked across sessions.

- **Notion data source ID:** `c463a282-268d-4509-b333-db0b64549229`
- **Work Board URL:** https://www.notion.so/922b87f60eb148ef945adf137c15818c
- **Local cache:** `context/work-board.md` (always keep in sync)

---

## Step 1 — Extract from conversation

Before writing anything, extract the following from the current session:

| Field | How to determine |
|---|---|
| **Task name** | Short imperative phrase describing the work, e.g. "AGFMA Engagement Progress Docs". Prefix with the CLT-N ID if one exists in `context/work-board.md`. |
| **Status** | Almost always `In Progress` when first created. Use `Review` if output was delivered and Jacob is reviewing. |
| **Project** | Match to the closest option: `Leave Liability`, `Group Spend`, `Category Analysis`, `Commercial Interventions`, `Spend Basetable`, `Cost-Out Strategy`, `Program Tracker`, `Skill Architecture`, `Ad Hoc`, `Project`, `PMO`. Use `Ad Hoc` for one-offs. |
| **Sector** | One of: `Group / Cross-Sector`, `Defence & Social Infra`, `Telecommunications`, `Transport`, `Infrastructure Services`. Default to `Group / Cross-Sector` if the work spans BUs or isn't tied to one. Telco-specific work (leave liability telco, telco cost-out) → `Telecommunications`. AGFMA / Defence → `Defence & Social Infra`. |
| **Use Case** | `Analysis`, `Excel Output`, `Word Output`, `PPTX`, `SQL`, `Data Request`, `Program`, `Strategy`, or `Other`. Pick the primary output type. |
| **Skill Used** | Zero or more of the registered skill names (see list below). |
| **Objective** | One line: what decision or output does this enable. |
| **Output** | File path(s) or URL(s) to the delivered output(s). One per line. |
| **Raised** | Today's date (ISO format: YYYY-MM-DD). |
| **Last Session** | Today's date. |
| **Body / session log** | A brief session log: what was done, key findings, blockers, next steps. Use headers (`##`) for structure. Keep it scannable. |

### Available Skill Used options
`analysis-scenario-model`, `analysis-data-request`, `analysis-commercial-insight`, `documents-davila7-xlsx`, `documents-docx`, `documents-pptx`, `program-epic-builder`, `program-exec-summary`, `program-tracker`, `program-steerco-pack`, `pipeline-working-construct`, `pipeline-partner-review`, `intelligence-market-intel`, `utility-draw-excalidraw-diagram`, `Other`

---

## Step 2 — Show confirmation card

Before writing to Notion, always show Jacob a confirmation card like this:

```
📋 Notion Work Board — confirm before logging

Task:       CLT-8 — AGFMA Engagement Progress
Status:     In Progress
Project:    Project
Sector:     Defence & Social Infra
Use Case:   Word Output
Skill Used: documents-docx
Objective:  Progress update docs for 3 GSC/AGFMA workstreams
Output:     4 - Projects/analysis/AGFMA/AGFMA_Engagement_Progress.docx
            4 - Projects/analysis/AGFMA/Rating&Ranking/AGFMA_RR_Gap_Analysis.docx
Raised:     2026-04-06
Body:       [session log with blockers and next steps]

→ OK to log? (yes / adjust fields)
```

Wait for Jacob to confirm. If he says adjust, apply his changes and re-show before writing.

---

## Step 3 — Write to Notion

Use `mcp__notion__notion-create-pages` with:
- `parent.type`: `data_source_id`
- `parent.data_source_id`: `c463a282-268d-4509-b333-db0b64549229`

Pass `Skill Used` as a JSON array string, e.g. `'["documents-docx"]'`.

Pass dates using the expanded property format: `date:Raised:start` and `date:Last Session:start`.

---

## Step 4 — Update local cache

After a successful Notion write, update `context/work-board.md`:
- Add the new entry to the **Active** section (or update the existing one)
- Format: CLT-ID, task name, status, project, last session date, output paths, next step

This keeps the local cache in sync so future sessions don't need an API call to understand current work state.

---

## Proactive trigger guidance

At the end of a session where you've delivered one or more output files (.docx, .xlsx, .pptx, analysis docs), if you haven't already pushed to Notion this session, ask:

> "Want me to log this in Notion?"

One line, no fuss. If Jacob says yes, run the skill immediately. If he says no or ignores it, drop it.

Do NOT ask if:
- It was a minor fix or iteration (no new output file)
- Jacob just asked a question
- The task is already on the board from this session
