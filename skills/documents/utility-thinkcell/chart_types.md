# think-cell Chart Types — Data Shape Reference

Claude reads this file to understand how to structure data for each chart type before calling `generate_ppttc.py`.

---

## 1. Waterfall / Bridge

### Data shape

- `categories`: list of string labels — period names, variance labels, and total markers in left-to-right order
- `data`: single series; values are **signed floats** — positive = increase, negative = decrease
- Use `null` for the first category (prior-year base) and for any subtotal/total bars — think-cell calculates these from the running sum

### Example

```json
{
  "name": "Chart1",
  "type": "chart",
  "categories": ["FY24A", "Procurement savings", "Volume mix", "Wage inflation", "Other", "FY25F"],
  "data": [
    ["EBIT", null, -18.5, 3.2, -6.1, 2.0, null]
  ]
}
```

### Notes

- The first and last values are typically `null` — think-cell treats null as a floating total bar anchored to the running sum.
- Do not pre-calculate the ending total; let think-cell derive it.
- If the template has a "100% stacked waterfall" variant, all values must sum to 0 except the base and end bars.
- Series label = row name (e.g. "EBIT") — this appears in the legend if enabled in the template.

---

## 2. Stacked Bar / Column

### Data shape

- `categories`: list of period or group labels (x-axis)
- `data`: N rows, one per series (stack segment); each row = `[series_name, value_cat1, value_cat2, ...]`
- Values must be non-negative for standard stacked; signed values supported for "diverging" stacked bar

### Example

```json
{
  "name": "SpendChart",
  "type": "chart",
  "categories": ["FY23", "FY24", "FY25"],
  "data": [
    ["Labour", 120, 135, 141],
    ["Materials", 85, 90, 88],
    ["Subcontract", 210, 195, 202],
    ["Overhead", 45, 48, 50]
  ]
}
```

### Notes

- Series order in `data` = stack order bottom-to-top (first row = bottom segment).
- For 100% stacked bar: values still represent absolutes — think-cell normalises if the template is configured for 100% mode.
- Negative values create downward segments in diverging bar charts.

---

## 3. Marimekko

### Data shape

- `categories`: column labels (x-axis groups)
- `data`: N rows where **row 0 = column widths** (proportional; think-cell normalises to 100%), rows 1..N = series segments
- Column widths are typically absolute values (e.g. $M spend) — think-cell converts to % of total

### Example

```json
{
  "name": "MekkoChart",
  "type": "chart",
  "categories": ["Telco", "Defence", "Transport", "Infrastructure"],
  "data": [
    ["Column Width", 450, 380, 290, 210],
    ["Tier 1 Panel",  60,  55,  45,  70],
    ["Tier 2 Panel",  25,  30,  35,  20],
    ["Off-panel",     15,  15,  20,  10]
  ]
}
```

### Notes

- Row 0 must be named something descriptive (e.g. "Column Width") — it is not rendered as a legend item, but the name helps Claude understand the structure.
- Each column's segment values (rows 1..N) should sum to 100 if expressing share %, or can be absolutes if think-cell is configured to normalise.
- Column widths must be positive.
- This is the most data-dense chart type — confirm with Jacob that the template supports the number of categories and series.

---

## 4. Bubble / Scatter

### Data shape

- `categories`: not used — pass an empty array `[]` or omit
- `data`: each row represents one bubble/point: `[label, x_value, y_value]` or `[label, x_value, y_value, bubble_size]`
- Bubble size is optional; if omitted, all bubbles render at equal size

### Example

```json
{
  "name": "BubbleChart",
  "type": "chart",
  "categories": [],
  "data": [
    ["Fleet procurement",    3.2,  18.5, 12],
    ["Labour rate review",   2.1,  14.0,  8],
    ["Subcontract panel",    4.5,  22.0, 15],
    ["Travel & expenses",    1.0,   4.5,  3],
    ["Direct materials",     3.8,  11.0, 10]
  ]
}
```

Where columns are: `[label, effort (1–5 scale), annual savings ($M), initiative size (headcount or $M)]`

### Notes

- Labels appear as think-cell data labels on each bubble — keep them short (< 30 chars).
- x and y scales are set in the template, not the data file. Confirm axis ranges with Jacob if the data exceeds template bounds.
- If bubble size is omitted from all rows, think-cell renders a standard scatter plot.

---

## 5. Combination (Bar + Line)

### Data shape

- Same structure as stacked bar
- `categories`: period labels
- `data`: N series rows — which series are bars and which are lines is controlled by the template configuration, **not the data**

### Example

```json
{
  "name": "ComboChart",
  "type": "chart",
  "categories": ["FY22", "FY23", "FY24", "FY25"],
  "data": [
    ["Revenue ($M)",    850,  920, 1050, 1120],
    ["Cost base ($M)",  640,  695,  790,  840],
    ["EBIT margin (%)",  7.1,  7.2,  6.9,  7.0]
  ]
}
```

### Notes

- The template defines which series index is a bar vs a line (typically set in the think-cell slide template at design time).
- Do not attempt to signal bar/line in the data JSON — it has no effect.
- Ensure the line series (typically a % or ratio) uses the secondary y-axis in the template; confirm with Jacob.
- Series names become legend labels — match to the axis they belong to for clarity.

---

## 6. Harvey Balls

### Data shape

- Harvey balls are single numeric values 0–100 representing fill % (0 = empty, 25 = quarter, 50 = half, 75 = three-quarter, 100 = full)
- Pass as an element with `type: "harvey_ball"` and a `value` field

### Example

```json
{
  "name": "Status_Procurement",
  "type": "harvey_ball",
  "value": 75
}
```

Multiple Harvey balls on one slide:

```json
{
  "elements": [
    {"name": "Status_Procurement",   "type": "harvey_ball", "value": 75},
    {"name": "Status_Workforce",     "type": "harvey_ball", "value": 50},
    {"name": "Status_OperatingModel","type": "harvey_ball", "value": 25},
    {"name": "Status_Technology",    "type": "harvey_ball", "value": 100},
    {"name": "SlideTitle",           "type": "text",        "value": "Program Readiness — Q1 FY26"}
  ]
}
```

### Notes

- Values are snapped to the nearest quarter (0, 25, 50, 75, 100) by think-cell. Intermediate values like 33 or 60 are valid inputs but render to the nearest standard fill.
- Element names must match the Harvey ball placeholder names in the template exactly.
- Harvey balls are typically used in status/tracker slides alongside text fields — always pair with a title element.
