---
name: exec-summary
description: Compress any analysis into a structured one-page executive summary as a Word document, formatted for CFO, ExCo, or senior stakeholder audiences.
---

# Skill: exec-summary

## Purpose

Takes any analysis output — from conversation, a file, or another skill's output — and compresses it into a structured one-page executive summary. Output is always a `.docx` file using python-docx.

## When to Invoke

Trigger phrases (exact or close variants):
- "exec summary", "one-pager", "summarise this for [audience]"
- "CFO summary", "ExCo brief", "make this executive-ready"
- After completing analysis that needs to be handed off to a senior audience

---

## One-Pager Structure

```
TITLE — [Topic]
Date | Status: DRAFT / FINAL | Prepared by: Transformation

1. SITUATION (2–3 sentences)
   Context: what is this, and why are we looking at it now?

2. FINDING (1–2 sentences — bolded)
   The single most important takeaway. Takes a position.
   No hedging. "X costs $Y more than benchmark" not "data suggests X may be higher."

3. EVIDENCE (3–5 bullets)
   Key facts supporting the finding. Every bullet must contain a number.
   No qualitative-only points.

4. IMPLICATIONS (2–3 bullets)
   What this means for the business.
   Connect to 8 figure FY26 / 9 figure 3-year target where relevant.

5. RECOMMENDATION (numbered list)
   Specific, assignable actions with owner and timeframe.
   Each action labelled: Quick Win / Requires Approval / Structural
   "Investigate X" is not a recommendation. "Jacob to present X to CFO by [date]" is.

6. RISKS & DEPENDENCIES (table)
   Columns: Risk | Impact | Mitigation
   Max 3–4 rows. Material risks only.
```

---

## Document Generation

- **Library:** python-docx only — never docx-js (won't open in Word for Mac)
- **Venv:** `/Users/jacob/Documents/The-Analyst/.venv`
- **Run pattern:** `source /Users/jacob/Documents/The-Analyst/.venv/bin/activate && python3 - << 'EOF' ... EOF`
- **Save path:** `4 - Projects/[project-name]/[YYMMDD]_Exec_Summary_[topic].docx`
- **Logo:** Include `Template/ventia_logo.png` top-left if file exists

### Brand Specifications

| Element | Value |
|---|---|
| Heading colour | Navy `#0B3254` |
| Section divider / accent | Blue `#13B5EA` |
| Body font | Source Sans Pro (fallback: Arial) |
| Currency | AUD, `$#,##0` format (no decimals) |
| Status default | DRAFT (unless Jacob says FINAL) |

---

## Execution Steps

1. **Identify source material** — use the most recent analysis in conversation, or load the file Jacob specifies. If ambiguous, ask one scoping question: "Which output should I summarise, and who is the audience?"

2. **Draft structure in conversation first** — show the six sections as plain text before generating the docx. Wait for Jacob to confirm or adjust before writing the file.

3. **Generate the docx** — use inline python-docx heredoc via Bash. Apply brand colours to headings, bold the Finding, render Risks as a Word table with a thin navy border.

4. **Save and confirm** — report the save path and flag any data gaps or unverified numbers.

---

## Design Principles

- **Lead with the Finding.** It is the most important section. It takes a clear position — not a hypothesis, not a hedge.
- **Every Evidence bullet has a number.** If you can't attach a figure, cut the bullet.
- **Recommendations are assignable.** Name an owner and a date. If you don't know the owner, flag it — don't leave it vague.
- **One page. Hard limit.** If it doesn't fit, cut content — never shrink font or margins.
- **60-second readability.** A time-poor CFO should finish it standing at a printer.
- **No AI language.** No "this analysis leverages", no "it is worth noting". Write like a project director briefing ExCo over coffee.

---

## Rules

- Never fabricate data or numbers — if source material is thin, say so in the Finding rather than manufacturing one
- If the source analysis doesn't support a clear position, write: "Finding: Insufficient data to draw a conclusion — [specific gap]" and recommend the data action
- Always mark DRAFT unless Jacob explicitly says FINAL
- Connect Implications and Recommendations to the multi-year cost program where there is a genuine link — do not force it
- Append a dated entry to `4 - Projects/[project-name]/log.md` on completion

---

## Ventia Context

- **Company:** Ventia Infrastructure Services (ASX:VNT) — Australian infrastructure services
- **Sectors:** Defence & Social Infrastructure (D&SI), Telco, Transport, Infrastructure Services
- **Cost program:** 8 figure FY26 productivity target / 9 figure 3-year transformation
- **Default audience:** CFO, ExCo, or sector leadership — senior, time-poor, decision-ready
- **Competitive set:** Broadspectrum, Downer, Spotless
- **All figures AUD unless stated**

---

## Wiki Compile (post-delivery)

After delivering the output, compile durable findings to the Knowledge Wiki. Read `context/wiki-compile-step.md` for the full checklist. Skip if the output is formatting-only or contains no new findings (apply the "so what" test).
