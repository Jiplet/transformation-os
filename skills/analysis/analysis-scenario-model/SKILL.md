---
name: scenario-model
description: Build financial scenario models for cost-out initiatives — Conservative/Base/Stretch with FY26–28 phasing, sensitivity table, and Excel workbook output.
---

# Scenario Model Skill

## Purpose
Build financial scenario models for cost productivity initiatives. Takes a cost lever and models Conservative/Base/Stretch outcomes with phasing across FY26–28. Output is always an Excel workbook with formulas — never hardcoded computed values.

## Trigger Phrases
- "model this", "scenario model", "what's the upside/downside", "size the opportunity"
- "how much could we save", "build a business case model", "financial model for [initiative]"
- When Jacob has identified a cost lever and wants to quantify the range of outcomes

---

## Execution Steps

### Step 1 — Define the Lever
Confirm the following before proceeding. If any are missing, ask Jacob directly:

- **What is being optimised?** (e.g. payment terms, vendor consolidation, travel policy, headcount)
- **What is the current cost base?** Annual run-rate in AUD. If unknown, flag as "requires data".
- **What are the available levers?** Rate / volume / mix / policy / process
- **What data exists?** Spendcube, data request outputs, or provided in conversation
- **What is the initiative timeline?** Any known constraints on FY26 landing (contracts, systems, approvals)

Do not proceed to Step 2 until cost base and lever type are confirmed.

---

### Step 2 — Build the Scenario Table
Three scenarios, each with stated assumptions:

| Scenario | Description | Saving % | What has to be true |
|---|---|---|---|
| Conservative | Minimum credible outcome — quick wins only | X% | [specific assumptions] |
| Base Case | Realistic outcome with normal execution | Y% | [specific assumptions] |
| Stretch | Best case with full execution and tailwinds | Z% | [specific assumptions] |

- Never present a single number — always a range (Conservative to Stretch)
- Separate one-off savings from recurring (annualised) savings
- Assumptions not confirmed by Jacob must be flagged as "⚠ Unverified"

---

### Step 3 — Phase Across Financial Years
Apply the following phasing logic (adjust if Jacob provides initiative-specific timelines):

| Lever Type | FY26 | FY27 | FY28 |
|---|---|---|---|
| Quick wins (policy enforcement, payment timing) | 100% | 100% | 100% |
| Negotiations (vendor consolidation, rate reduction) | 50% | 100% | 100% |
| Structural (operating model, system changes) | 0% | 50% | 100% |

- FY26: What can land this year (~9 months remaining from July 2025)
- FY27: What requires structural change (contracts, systems, policy)
- FY28: Full run-rate once changes are embedded

---

### Step 4 — Sensitivity Table
Show outcomes at 5%, 10%, 15%, 20%, 25% reduction on the cost base:

| Saving % | Annual Saving ($) | 3-Year Cumulative ($) | % of $100m FY26 Target | % of $300m 3-Year Target |
|---|---|---|---|---|
| 5% | | | | |
| 10% | | | | |
| 15% | | | | |
| 20% | | | | |
| 25% | | | | |

All cells formula-driven. Reference the cost base input cell — do not hardcode.

---

### Step 5 — Generate Excel Workbook

**ALWAYS invoke the davila7-xlsx skill pattern.** Never use raw openpyxl without the skill.

**Venv:** `/Users/jacob/Documents/The-Analyst/.venv`
**Logo:** `Template/ventia_logo.png`
**Save to:** `4 - Projects/[initiative-name]/[YYMMDD]_Scenario_Model_[name].xlsx`

#### Workbook Structure (4 tabs)

**Tab 1 — Cover**
- Ventia logo top-left (white/no-fill header band — do not use navy band behind logo)
- Report title, large navy text
- Synopsis: max 2 sentences — state the initiative and how the model was built. Then dot points for key findings.
- Assumptions: listed in full. Mark unverified assumptions with "⚠ Unverified".
- Tab guide: one-line description per sheet

**Tab 2 — Scenario Model**
Columns: Cost Base | Saving % | Annual Saving $ | FY26 Phased | FY27 Phased | FY28 Phased | 3-Year Cumulative

- One row per scenario: Conservative / Base Case / Stretch
- All savings cells use formulas (e.g. `=cost_base * saving_pct`)
- Phased columns reference the lever type phasing percentages as named cells or a lookup
- Assumptions block below the table — label each one, mark unverified

**Tab 3 — Sensitivity**
- Matrix: saving % rows (5%–25%) × metric columns (Annual $, 3-Year Cumulative, % of $100m, % of $300m)
- Single input cell for cost base at top of sheet — all formulas reference it
- Highlight the Base Case row

**Tab 4 — Phasing**
- Waterfall / build view: FY26 → FY27 → FY28 run-rate
- Split by lever type (Quick Win / Negotiation / Structural)
- Show cumulative savings build across 3 years per scenario

#### Formula & Quality Rules
- Use Excel formulas — `=SUM()`, `=AVERAGE()`, `=cell_ref * pct_ref` — never hardcode computed values
- Named ranges for key inputs: cost base, saving percentages, phasing factors
- Currency format: `$#,##0` (no decimals) for all dollar cells
- Percentage format: `0%` for all rate cells
- Run `recalc.py` to verify zero formula errors before delivery if available

---

## Ventia Context

| Field | Value |
|---|---|
| Company | Ventia Infrastructure Services (ASX:VNT) |
| Cost program | $100m FY26 / $300m 3-year |
| Currency | AUD — formatted `$#,##0` (no decimals) |
| Primary colour | Navy `#0B3254` |
| Accent | Bright Blue `#13B5EA` |
| Font | Source Sans Pro (fallback: Arial) |
| No | Pie charts, 3D effects, WordArt |

---

## Rules

1. Always use Excel formulas — never hardcode computed values
2. Verify assumptions with Jacob before generating the workbook — ask if not provided
3. Never present a single savings number — always Conservative to Stretch range
4. Separate one-off savings from recurring (annualised) savings
5. Phase realistically — do not assume everything lands in FY26
6. Flag unverified assumptions with "⚠ Unverified" on the cover sheet
7. If cost base is unknown, ask Jacob or mark as "requires data" — do not guess
8. Append a dated entry to `4 - Projects/[initiative-name]/log.md` on completion
