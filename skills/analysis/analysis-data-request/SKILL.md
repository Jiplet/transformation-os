---
name: data-request
description: "Generates a structured data request document (Word .docx) for Ventia's analytics team, plus an internal analysis methodology section. Use when Jacob needs to request a data extract or analytical output from the data/analytics team. Triggers: 'data request', 'ask analytics', 'request data', 'what do I ask the data team', or any request to produce a formal data ask."
---

# Data Request Document Generator

## Role
You are a senior analyst at Ventia. Your job is to produce a clear, precise data request that the analytics team can execute without back-and-forth, and an internal methodology section Jacob can use to analyse the output.

---

## Step 1 — Clarify Before Building

If the analysis goal is not clear from context, ask:

1. **What is the analysis goal?** (e.g. payment terms optimisation, vendor concentration, project profitability, headcount review)
2. **Which data sources are involved?** AP (supplier payments), AR (client collections), Spend, Projects/contracts, HR, or other?
3. **What decision will this enable?** (helps set the right level of detail)

If Jacob has already provided sufficient context (e.g. in the conversation), skip this and proceed directly.

---

## Step 2 — Determine Modules

Based on the analysis, select which modules apply:

| Module | Trigger |
|---|---|
| **AP** | Supplier payments, payment terms, DPO, cash release from paying late |
| **AR** | Client collections, DSO, overdue debtors, cash acceleration |
| **Spend** | Vendor spend analysis, category/sector breakdown, concentration |
| **Projects** | Contract performance, project cost, margin, milestone payments |
| **Custom** | Any other data source — build field table from first principles |

Multiple modules can apply to a single request.

---

## Step 3 — Core Principles (always apply)

**Aggregation:** Always ask for a **summary-level output** — one row per vendor/client/project. Never request raw transaction rows unless there is a specific reason. The analytics team runs calculations in Databricks; raw data is too large for Excel and moves the analytical work to Jacob unnecessarily.

**Distribution:** Always include Min / Max / Median alongside averages. The spread tells you whether a behaviour is consistent (fixable with a single instruction) or erratic (a process issue requiring investigation).

**Flags:** Always include a flag column where there is a constraint that limits actionability:
- AP → `Subcontractor_Flag` (Y if vendor is linked to a client pass-through obligation)
- AR → `Contract_Type_Flag` (Y if fixed/locked terms — e.g. government, fixed-price)
- Others → identify the equivalent constraint and flag it

**Calculations:** Ask analytics to pre-calculate derived metrics (DPO, DSO, days early/late, cash opportunity). Define the exact formula so there is no ambiguity.

---

## Module Reference

### AP Module — Supplier Payment Summary

One row per supplier. Analytics calculates in Databricks.

| Field | Formula / Notes |
|---|---|
| Supplier_ID | ERP vendor master ID |
| Supplier_Name | |
| Sector | Telco / Infra / D&SI / Transport |
| Invoice_Count | Count of invoices in period |
| Total_Spend_AUD | Sum of invoice amounts, converted to AUD |
| Contractual_Terms_Days | Mode (most common) payment terms — numeric days (30, 45, 60 etc.) |
| Avg_Actual_DPO | AVG(Payment_Date − Invoice_Date) across paid invoices |
| Min_DPO | MIN — earliest payment made |
| Max_DPO | MAX — latest payment made |
| Median_DPO | MEDIAN — distribution check |
| Count_Invoices_Paid_Early | Count where Actual_DPO < Contractual_Terms_Days |
| Pct_Invoices_Paid_Early | Count_Paid_Early / Invoice_Count |
| Avg_Days_Early | AVG(Contractual − Actual DPO) for early-paid invoices only |
| Cash_Release_Opp_AUD | IF Avg_Days_Early > 0: Total_Spend × (Avg_Days_Early / 365). Else 0. |
| Subcontractor_Flag | Y if majority of spend is coded to a client pass-through project |

**Standard AP filters:**
- Paid invoices only (for DPO calcs)
- Period: specify FY or date range
- Spend threshold: ≥[$X] total across period covers ~93% of addressable AP spend (~3,500 vendors)

**Always add as a secondary table:** Open/unpaid invoices past due date — Supplier, Total_Overdue_AUD, Avg_Days_Past_Due.

---

### AR Module — Client Collection Summary

One row per client/contract. Analytics calculates in Databricks.

| Field | Formula / Notes |
|---|---|
| Client_ID | ERP customer master ID |
| Client_Name | |
| Contract_Number | |
| Sector | |
| Invoice_Count | Count of invoices in period |
| Total_Billings_AUD | Sum of invoice amounts |
| Contractual_Terms_Days | Payment terms per contract — numeric days |
| Avg_Actual_DSO | AVG(Payment_Date − Invoice_Date) across paid invoices |
| Min_DSO | MIN — fastest client has ever paid |
| Max_DSO | MAX — slowest payment on record |
| Median_DSO | MEDIAN |
| Outstanding_Balance_AUD | Sum of all unpaid invoices as at today |
| Avg_Days_Overdue | AVG(Today − Due_Date) for unpaid invoices past due only |
| Count_Invoices_Paid_Late | Count where Actual_DSO > Contractual_Terms_Days |
| Pct_Invoices_Paid_Late | Count_Paid_Late / Invoice_Count |
| Avg_Days_Late | AVG(Actual_DSO − Contractual) for late-paid invoices only |
| Cash_Accel_Opp_AUD | IF Avg_Days_Late > 0: Total_Billings × (Avg_Days_Late / 365). Else 0. |
| Contract_Type_Flag | Y if fixed/locked payment terms (government, fixed-price contract) |

**Standard AR filters:**
- All clients — no spend threshold (AR is typically fewer, larger accounts)
- Period: specify FY or date range

---

### Spend Module

Reference `data/reference/spend_data_schema.md` for field names and definitions. Do not re-explore source files.

For spend requests, analytics can pull directly from the Spend_Master_RawData source. Ask for a vendor/category/sector summary consistent with the analytical goal — not raw transaction rows.

---

### Projects Module

One row per project or contract. Fields depend on the question — build from:
- Project_ID, Project_Name, Sector, BU
- Contract_Value_AUD, Recognised_Revenue_AUD, Cost_AUD, Margin_AUD, Margin_Pct
- Project_Status, Start_Date, End_Date, Forecast_Completion
- Any specific milestone or cost-to-complete fields relevant to the analysis

---

## Step 4 — Document Structure

The output document always has two sections:

**Section 1: Data Request** — sent to analytics team
- Title, Requestor, Priority, Purpose
- One sub-section per extract (Extract 1, Extract 2 etc.)
  - Description (summary-level, run calcs in Databricks)
  - Fields table
  - Filters
- Format requirements (Excel/CSV, flat table, headers row 1)
- Additional context (explain flags, constraints, why fields matter)

**Section 2: Internal — Analysis Methodology** — Jacob's working guide
- How to review the output once received
- Actionability segmentation (Quick Win / Negotiable / Constrained)
- Interest saving / cash release calculation
- One-off vs ongoing saving distinction
- What good output looks like (one-pager summary)

Clearly separate the two sections with a horizontal rule and label Section 2 as internal.

---

## Step 5 — Generate the Document

Use python-docx to generate the Word document. Apply Ventia colours:
- Dark navy `1F2D3D` for primary headings and section headers
- Mid blue `2E4A6B` for table headers and sub-headings
- Light blue `EEF4FB` for alternating table rows
- White `FFFFFF` for text on dark backgrounds

Standard table style: header row dark, alternating row fill, 9pt Calibri, wrap text in header.

**Save location:** `4 - Projects/[type]-[analysis-name]/`
- Create the folder if it doesn't exist
- Filename: `YYMMDD_Data request_[short name].docx` using today's date
- Also save the build script as `build_[name].py` in the same folder for re-use

---

## Step 6 — Analysis Methodology Content

Include these sections in Section 2, adapted to the modules used:

### For AP analysis:
- Sort Cash_Release_Opp_AUD descending — that is the ranked priority list
- Bucket by actionability:
  - **Quick Win**: Subcontractor_Flag = N AND Avg_Days_Early > 5 → instruct AP to pay on due date
  - **Negotiable**: Subcontractor_Flag = N AND short terms ≤ 30 days → approach vendor to extend
  - **Constrained**: Subcontractor_Flag = Y → quantify and set aside
- Interpret the DPO range: narrow Min/Max = consistent behaviour (single AP instruction fixes it); wide range = process issue, investigate
- Size the interest saving: (Quick Win + Negotiable cash release) × borrowing rate. Get rate from Treasury; proxy 6.5%

### For AR analysis:
- Sort Cash_Accel_Opp_AUD descending
- Clients with Avg_Days_Late > 0 = outside contractual terms → formal demand
- Contract_Type_Flag = Y → limited leverage, note separately
- Outstanding_Balance is immediate cash — prioritise over historical DSO averages
- Persistent late payers (high Pct_Invoices_Paid_Late) need commercial escalation, not just reminders

### One-off vs ongoing (always include when AP or AR involved):
- **One-off cash release**: extending terms / accelerating collections reduces average drawn balance on facility — a balance sheet event
- **Ongoing annual saving**: the interest cost avoided each year by holding that cash longer — a P&L event
- Present both separately — they are different stories for different audiences

---

## Rules
- Never ask analytics to send raw transaction rows when a summary will do
- Always define formulas explicitly — "AVG(Payment_Date − Invoice_Date)" not "average DPO"
- Always include a constraint flag (Subcontractor / Contract_Type or equivalent) — without it, actionable and non-actionable opportunities can't be separated
- Section 2 is for Jacob only — label it clearly so analytics don't action it
- If the borrowing rate is unknown, use 6.5% as a proxy and note it
- Keep the data request tight — analytics should be able to execute it without a follow-up question
