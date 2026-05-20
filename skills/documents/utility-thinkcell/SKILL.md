---
name: thinkcell
description: Generate think-cell .ppttc files from analysis data using Slideworks templates. Use when Jacob asks for a waterfall, bridge chart, Marimekko, stacked bar, combination chart, bubble/scatter, Harvey ball, or says "think-cell chart".
---

# think-cell Chart Generator

Generates `.ppttc` data files that populate think-cell charts in a PowerPoint template. The `.ppttc` file carries only data — all colours, fonts, axis formatting, and chart aesthetics are controlled by the underlying `.pptx` template.

## Overview

think-cell is the charting layer on top of PowerPoint used for waterfall/bridge, Marimekko, stacked bar/column, combination, bubble/scatter, and Harvey ball charts. This skill:

1. Takes Jacob's analysis data and chart intent
2. Matches it to a registered template in `templates.yaml`
3. Structures the data into the ppttc JSON format
4. Runs `generate_ppttc.py` to produce the `.ppttc` output file
5. Delivers a file Jacob can double-click to render in PowerPoint

## Workflow

### Step 1 — Identify chart type

Read Jacob's request and classify the chart type. Common signals:

| Jacob says | Chart type |
|---|---|
| "waterfall", "bridge", "variance bridge" | waterfall |
| "stacked bar", "stacked column", "100% bar" | stacked_bar |
| "Marimekko", "mekko", "market map" | marimekko |
| "bubble", "scatter", "BCG matrix" | bubble |
| "combo chart", "bar and line", "combination" | combination |
| "Harvey ball", "completion status", "progress dot" | harvey_ball |

### Step 2 — Find matching template

Read `templates.yaml` in this skill folder. Match on `category` and `tags` against the chart type and context (e.g. project name, sector, use case).

If no registered template matches: ask Jacob which `.pptx` template to use, then register it with `register_template.py` before proceeding.

### Step 3 — Determine data shape

Read `chart_types.md` in this skill folder. Find the section for the matched chart type and confirm:
- What the `categories` array should contain
- How to structure the `data` rows (series × values)
- Any pitfalls (e.g. Marimekko column widths in row 0)

### Step 4 — Structure the data JSON

Build the `elements` array:

```json
{
  "elements": [
    {
      "name": "Chart1",
      "type": "chart",
      "categories": ["FY24A", "Cost-out", "Volume", "FY25F"],
      "data": [
        ["EBIT", 120, -15, 8, null]
      ]
    },
    {
      "name": "Title",
      "type": "text",
      "value": "EBIT Bridge FY24A–FY25F ($M)"
    }
  ]
}
```

Element names must match the placeholder names in the `.pptx` template exactly (case-sensitive). Check `templates.yaml` → `elements[].name` for the correct names.

### Step 5 — Run generate_ppttc.py

```bash
source /Users/jacob/Documents/The-Analyst/.venv/bin/activate && python3 /Users/jacob/Documents/The-Analyst/.claude/skills/utility-thinkcell/generate_ppttc.py \
  --template <path/to/template.pptx> \
  --output <project_folder/output.ppttc> \
  --data '<json_string>'
```

Or pass a JSON file path to `--data` if the payload is large.

### Step 6 — Save to active project folder

Output path convention: `4 - Projects/[project-name]/[chart-name].ppttc`

Never save to the skill folder or to `/tmp/` for production outputs.

### Step 7 — Deliver to Jacob

Tell Jacob:

> "Double-click `[file].ppttc` to render in PowerPoint with think-cell."

If the template `.pptx` path was provided by Jacob this session, also confirm which slide number the chart will populate.

---

## Registering New Templates

When a new `.pptx` template is bootstrapped or Jacob provides a new slide deck:

```bash
source /Users/jacob/Documents/The-Analyst/.venv/bin/activate && python3 /Users/jacob/Documents/The-Analyst/.claude/skills/utility-thinkcell/register_template.py \
  --name "AGFMA Waterfall" \
  --path "/Users/jacob/Documents/The-Analyst/Template/thinkcell/agfma_waterfall.pptx" \
  --category waterfall \
  --use-case "AGFMA cost-out bridge FY25–FY26" \
  --elements '[{"name": "Chart1", "type": "chart", "data_shape": "categories x signed values"}, {"name": "Title", "type": "text", "data_shape": "string"}]'
```

This appends the entry to `templates.yaml`. Store the `.pptx` file in `Template/thinkcell/`.

---

## Supported Chart Types

| Type | think-cell name | Typical use |
|---|---|---|
| Waterfall / bridge | `waterfall` | P&L bridge, cost-out variance, EBIT walk |
| Stacked bar / column | `stacked_bar` | Category spend by year, headcount by function |
| Marimekko | `marimekko` | Market share map, spend by category × BU |
| Bubble / scatter | `bubble` | Initiative prioritisation (effort vs value), vendor positioning |
| Combination | `combination` | Revenue bars + margin % line |
| Harvey balls | `harvey_ball` | Program status, initiative readiness |

---

## Important Notes

- Chart formatting (colours, axis labels, number format, fonts) is **entirely controlled by the `.pptx` template** — do not attempt to set these in the ppttc JSON.
- Element `name` values are **case-sensitive** and must match the template placeholders exactly.
- Null values in data arrays create gaps in waterfall charts (think-cell treats them as subtotals or blank segments depending on template config).
- The `thinkcell` PyPI library wraps the Slideworks API. The generated `.ppttc` is standard JSON — always validate with `python3 -m json.tool` before delivery.
