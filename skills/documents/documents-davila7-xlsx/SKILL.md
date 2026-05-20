---
name: xlsx
description: "Spreadsheet toolkit (.xlsx/.csv). Create/edit with formulas/formatting, analyze data, visualization, recalculate formulas, for spreadsheet processing and analysis."
license: Proprietary. LICENSE.txt has complete terms
---

# Requirements for Outputs

## All Excel files

### Zero Formula Errors
- Every Excel model MUST be delivered with ZERO formula errors (#REF!, #DIV/0!, #VALUE!, #N/A, #NAME?)

### Preserve Existing Templates (when updating templates)
- Study and EXACTLY match existing format, style, and conventions when modifying files
- Never impose standardized formatting on files with established patterns
- Existing template conventions ALWAYS override these guidelines

## Ventia Brand Standards

**Apply Ventia styling to all new Ventia workbooks unless the file has an established template.**

### Colour Palette (openpyxl hex — no `#` prefix)

| Role | Name | Hex | openpyxl constant |
|---|---|---|---|
| Primary | Dark Navy | 0B3254 | `NAVY = "0B3254"` |
| Secondary | Bright Blue | 13B5EA | `BLUE = "13B5EA"` |
| Tertiary | Light Blue | B1DAF6 | `LIGHT_BLUE = "B1DAF6"` |
| Highlight | Purple | 95358C | `PURPLE = "95358C"` |
| Positive | Dark Green | 006E47 | `DARK_GREEN = "006E47"` |
| Positive (alt) | Green | 009946 | `GREEN = "009946"` |
| Positive (light) | Light Green | 7BC143 | `LIGHT_GREEN = "7BC143"` |
| Neutral BG | Light Grey | E6EAEE | `LIGHT_GREY = "E6EAEE"` |
| Muted | Grey Blue | 8598A9 | `GREY_BLUE = "8598A9"` |
| Text | Black | 000000 | `BLACK = "000000"` |
| Background | White | FFFFFF | `WHITE = "FFFFFF"` |

Paste these constants at the top of any build script:
```python
NAVY, BLUE, LIGHT_BLUE = "0B3254", "13B5EA", "B1DAF6"
PURPLE = "95358C"
DARK_GREEN, GREEN, LIGHT_GREEN = "006E47", "009946", "7BC143"
LIGHT_GREY, GREY_BLUE = "E6EAEE", "8598A9"
BLACK, WHITE = "000000", "FFFFFF"
```

### Cover / Title Sheet Pattern

Every Ventia workbook should include a styled cover sheet as Sheet 1.

**Header band is WHITE (no fill)** — the Ventia logo has blue text that clashes with a navy background.

**Cover content — in this order:**
1. **Ventia logo** — top-left
2. **Report title** — large, navy text
3. **Synopsis** — max 2 plain-English sentences stating the hypothesis and approach. No AI-sounding language ("this analysis leverages...", "comprehensive review..."). Write like you're briefing a project director over coffee. Follow with dot-point key findings.
4. **Assumptions** — clearly listed. Every assumption must be verified with the user during planning (plan mode or conversation). If unverified, prefix with "⚠ Unverified:". Never assume silently.
5. **How to Read This Workbook** — list each tab with a one-line description of what it contains and what to look for. This is for stakeholders receiving the handover.

```python
from openpyxl.drawing.image import Image as XLImage

cover = wb.create_sheet("Cover", 0)
cover.sheet_view.showGridLines = False

# White header band (rows 1–6) — no fill, logo has blue text
# (No fill loop needed — default is white)

# Ventia logo — top-left
logo_path = "/Users/jacob/Documents/The-Analyst/Template/ventia_logo.png"
if os.path.exists(logo_path):
    img = XLImage(logo_path)
    img.height, img.width = 48, 120
    cover.add_image(img, "B2")

# Report title (navy, large, row 4)
cover["C4"].value = "Report Title"
cover["C4"].font = Font(name="Arial", bold=True, size=24, color=NAVY)

# Subtitle / date (Bright Blue, row 5)
cover["C5"].value = "Subtitle or date"
cover["C5"].font = Font(name="Arial", size=12, color=BLUE)

# Blue rule divider
for row in cover.iter_rows(min_row=7, max_row=7, min_col=1, max_col=20):
    for cell in row:
        cell.fill = PatternFill("solid", fgColor=BLUE)

# Synopsis starts row 9 — plain English, 2 sentences max
cover["B9"].value = "Synopsis: [2-sentence hypothesis and approach]"
cover["B9"].font = Font(name="Arial", size=11, color=BLACK)
# Follow with dot-point findings in rows below

# Assumptions section — label row, then dot points
# assumptions_start_row = after synopsis
# cover.cell(row=X, column=2).value = "Assumptions"
# cover.cell(row=X, column=2).font = Font(name="Arial", bold=True, size=11, color=NAVY)

# How to Read This Workbook — tab schema for stakeholders
# cover.cell(row=Y, column=2).value = "How to Read This Workbook"
# cover.cell(row=Y, column=2).font = Font(name="Arial", bold=True, size=11, color=NAVY)
# List each tab with one-line description

cover.row_dimensions[1].height = 8
for r in range(2, 6): cover.row_dimensions[r].height = 18
cover.row_dimensions[7].height = 4
cover.column_dimensions["A"].width = 2
cover.column_dimensions["B"].width = 18
```

**Logo extraction (one-off setup):**
```python
from pptx import Presentation
import os, shutil

prs = Presentation("/Users/jacob/Documents/The-Analyst/Template/MASTER_Ventia - PowerPoint template.pptx")
logo_dest = "/Users/jacob/Documents/The-Analyst/Template/ventia_logo.png"
for slide in prs.slides:
    for shape in slide.shapes:
        if shape.shape_type == 13:  # MSO_SHAPE_TYPE.PICTURE
            with open(logo_dest, "wb") as f:
                f.write(shape.image.blob)
            print(f"Logo saved: {logo_dest}")
            break
    if os.path.exists(logo_dest): break
```

### Table Formatting Standards

| Element | Style |
|---|---|
| Header row | Dark Navy (`0B3254`) fill, White text, 11pt bold |
| Body rows | Alternating White / Light Grey (`E6EAEE`), 10pt regular |
| Text columns | Left-aligned |
| Number columns | Right-aligned |
| Totals / key rows | Bright Blue (`13B5EA`) fill, White text |
| Borders | No vertical borders; thin horizontal Light Grey between rows |

```python
def style_header_row(ws, row_num, max_col):
    for col in range(1, max_col + 1):
        cell = ws.cell(row=row_num, column=col)
        cell.fill = PatternFill("solid", fgColor=NAVY)
        cell.font = Font(name="Arial", bold=True, size=11, color=WHITE)
        cell.alignment = Alignment(horizontal="left")

def style_data_rows(ws, start_row, end_row, max_col):
    for row in range(start_row, end_row + 1):
        bg = WHITE if (row - start_row) % 2 == 0 else LIGHT_GREY
        for col in range(1, max_col + 1):
            ws.cell(row=row, column=col).fill = PatternFill("solid", fgColor=bg)
```

### Charts — Mode Selection

**Before generating any charts, ask the user:**
> "Do you need these charts to be editable in Excel, or exec-quality (embedded as images)?"

| Mode | Library | When to use | Trade-off |
|---|---|---|---|
| **Editable** | openpyxl chart objects | Working models, iterative analysis | Limited styling |
| **Exec-quality** | matplotlib → PNG embedded | CFO packs, steerco, handovers | Not editable in Excel |

Default recommendation: **exec-quality** unless the user says the workbook is a working model or needs chart editability.

### Colour Series Order (both modes)

| Order | Name | Hex (openpyxl) | matplotlib |
|---|---|---|---|
| 1 | Dark Navy | `0B3254` | `#0B3254` |
| 2 | Bright Blue | `13B5EA` | `#13B5EA` |
| 3 | Light Blue | `B1DAF6` | `#B1DAF6` |
| 4 | Green | `009946` | `#009946` |
| 5 | Light Green | `7BC143` | `#7BC143` |
| 6 | Grey Blue | `8598A9` | `#8598A9` |

Positive variance → Green (`#009946`). Negative variance → Purple (`#95358C`).

### Exec-Quality Charts (matplotlib)

#### Ventia Theme Setup
Paste at the top of any build script that uses matplotlib charts:

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from matplotlib.patches import FancyBboxPatch
from openpyxl.drawing.image import Image as XLImage
import tempfile, os

# Ventia palette — matplotlib format
V_NAVY, V_BLUE, V_LIGHT_BLUE = "#0B3254", "#13B5EA", "#B1DAF6"
V_GREEN, V_LIGHT_GREEN = "#009946", "#7BC143"
V_GREY_BLUE, V_PURPLE = "#8598A9", "#95358C"
V_SERIES = [V_NAVY, V_BLUE, V_LIGHT_BLUE, V_GREEN, V_LIGHT_GREEN, V_GREY_BLUE]

FONT_FAMILY = "Source Sans Pro"
# Fallback if Source Sans Pro not installed
try:
    from matplotlib.font_manager import findfont, FontProperties
    findfont(FontProperties(family=FONT_FAMILY), fallback_to_default=False)
except ValueError:
    FONT_FAMILY = "Arial"

plt.rcParams.update({
    "font.family": FONT_FAMILY,
    "font.size": 10,
    "axes.titlesize": 13,
    "axes.titleweight": "bold",
    "axes.labelsize": 10,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.edgecolor": "#CCCCCC",
    "axes.titlecolor": V_NAVY,
    "axes.labelcolor": V_NAVY,
    "xtick.color": "#666666",
    "ytick.color": "#666666",
    "figure.facecolor": "white",
    "axes.facecolor": "white",
    "legend.frameon": False,
    "legend.fontsize": 9,
})
```

#### Embed Helper
Use this to place a matplotlib figure into an Excel sheet:

```python
def embed_chart(fig, ws, anchor="B2", width_cm=16, height_cm=10, dpi=200):
    """Save matplotlib figure and embed as image in worksheet."""
    tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    fig.savefig(tmp.name, dpi=dpi, bbox_inches="tight", facecolor="white", edgecolor="none")
    plt.close(fig)
    img = XLImage(tmp.name)
    img.width = width_cm * 37.8  # cm to px approx
    img.height = height_cm * 37.8
    ws.add_image(img, anchor)
    return tmp.name  # caller can os.remove() after wb.save()
```

#### Supported Chart Types

**Horizontal bar** (preferred for category comparisons):
```python
fig, ax = plt.subplots(figsize=(8, 5))
bars = ax.barh(categories, values, color=V_SERIES[:len(categories)])
ax.set_xlabel("Spend ($M)")
ax.set_title("Spend by Category")
ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))
for bar, val in zip(bars, values):
    ax.text(bar.get_width() + max(values)*0.01, bar.get_y() + bar.get_height()/2,
            f"${val:,.0f}", va="center", fontsize=9, color=V_NAVY)
fig.tight_layout()
```

**Stacked bar** (composition over time):
```python
fig, ax = plt.subplots(figsize=(8, 5))
bottom = [0] * len(periods)
for i, (label, vals) in enumerate(series.items()):
    ax.bar(periods, vals, bottom=bottom, label=label, color=V_SERIES[i % len(V_SERIES)])
    bottom = [b + v for b, v in zip(bottom, vals)]
ax.set_title("Spend Composition by Period")
ax.legend(loc="upper left", bbox_to_anchor=(1, 1))
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))
fig.tight_layout()
```

**Waterfall** (variance / bridge):
```python
def waterfall_chart(labels, values, title="Bridge"):
    fig, ax = plt.subplots(figsize=(10, 5))
    cumulative = 0
    bottoms, colors = [], []
    for i, v in enumerate(values):
        if i == 0 or i == len(values) - 1:  # start/end totals
            bottoms.append(0)
            colors.append(V_NAVY)
        elif v >= 0:
            bottoms.append(cumulative)
            colors.append(V_GREEN)
        else:
            bottoms.append(cumulative + v)
            colors.append(V_PURPLE)
        if i != len(values) - 1:
            cumulative += v
    ax.bar(labels, [abs(v) for v in values], bottom=bottoms, color=colors, width=0.6)
    for i, (lbl, v) in enumerate(zip(labels, values)):
        y = bottoms[i] + abs(v) / 2
        ax.text(i, y, f"${v:+,.0f}" if i not in (0, len(values)-1) else f"${v:,.0f}",
                ha="center", va="center", fontsize=9, fontweight="bold", color="white")
    ax.set_title(title)
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))
    fig.tight_layout()
    return fig
```

**Combo bar + line** (actuals vs target):
```python
fig, ax1 = plt.subplots(figsize=(8, 5))
ax1.bar(periods, actuals, color=V_NAVY, label="Actual", width=0.5)
ax2 = ax1.twinx()
ax2.plot(periods, targets, color=V_BLUE, marker="o", linewidth=2, label="Target")
ax1.set_title("Actual vs Target")
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc="upper left")
fig.tight_layout()
```

**Donut** (use sparingly — only for single-metric share):
```python
fig, ax = plt.subplots(figsize=(5, 5))
wedges, texts, autotexts = ax.pie(
    values, labels=labels, colors=V_SERIES[:len(values)],
    autopct="%1.0f%%", startangle=90, pctdistance=0.75,
    wedgeprops=dict(width=0.4, edgecolor="white", linewidth=2))
for t in autotexts:
    t.set_fontsize(9)
    t.set_fontweight("bold")
ax.set_title("Share of Spend")
fig.tight_layout()
```

#### Chart Standards
- **No pie charts** in full-circle form — use donut or horizontal bar instead
- **No 3D effects, no gradients, no shadows**
- **Always include a clear title** — title states the insight, not just the metric (e.g. "Telco dominates discretionary spend" not "Spend by Sector")
- **Data labels** on bars/waterfall — readers shouldn't need to eyeball the axis
- **Currency axis**: always formatted `$#,##0` with `mticker.FuncFormatter`
- **Legend** outside plot area when >3 series
- **Figure size**: default `(8, 5)` for full-width, `(5, 5)` for square/donut
- **DPI**: 200 for embedded Excel, 300 if also used in slides
- **Clean up temp files** after `wb.save()` — collect paths from `embed_chart()` and `os.remove()`

### Editable Charts (openpyxl)

Use openpyxl chart objects when the user explicitly requests editable charts. Apply the colour series order above. Note: styling control is limited — set chart.style, series fill, and axis labels but expect "default Excel" appearance.

```python
from openpyxl.chart import BarChart, Reference
from openpyxl.chart.series import DataPoint
from openpyxl.drawing.fill import PatternFillProperties, ColorChoice

chart = BarChart()
chart.type = "col"
chart.title = "Chart Title"
chart.y_axis.title = "Values"
data = Reference(ws, min_col=2, max_col=3, min_row=1, max_row=10)
cats = Reference(ws, min_col=1, min_row=2, max_row=10)
chart.add_data(data, titles_from_data=True)
chart.set_categories(cats)
chart.shape = 4
ws.add_chart(chart, "E2")
```

---

## Financial models

### Color Coding Standards
Unless otherwise stated by the user or existing template

#### Industry-Standard Color Conventions
- **Blue text (RGB: 0,0,255)**: Hardcoded inputs, and numbers users will change for scenarios
- **Black text (RGB: 0,0,0)**: ALL formulas and calculations
- **Green text (RGB: 0,128,0)**: Links pulling from other worksheets within same workbook
- **Red text (RGB: 255,0,0)**: External links to other files
- **Yellow background (RGB: 255,255,0)**: Key assumptions needing attention or cells that need to be updated

### Number Formatting Standards

#### Required Format Rules
- **Years**: Format as text strings (e.g., "2024" not "2,024")
- **Currency**: Use $#,##0 format; ALWAYS specify units in headers ("Revenue ($mm)")
- **Zeros**: Use number formatting to make all zeros "-", including percentages (e.g., "$#,##0;($#,##0);-")
- **Percentages**: Default to 0.0% format (one decimal)
- **Multiples**: Format as 0.0x for valuation multiples (EV/EBITDA, P/E)
- **Negative numbers**: Use parentheses (123) not minus -123

### Formula Construction Rules

#### Assumptions Placement
- Place ALL assumptions (growth rates, margins, multiples, etc.) in separate assumption cells
- Use cell references instead of hardcoded values in formulas
- Example: Use =B5*(1+$B$6) instead of =B5*1.05

#### Formula Error Prevention
- Verify all cell references are correct
- Check for off-by-one errors in ranges
- Ensure consistent formulas across all projection periods
- Test with edge cases (zero values, negative numbers)
- Verify no unintended circular references

#### Documentation Requirements for Hardcodes
- Comment or in cells beside (if end of table). Format: "Source: [System/Document], [Date], [Specific Reference], [URL if applicable]"
- Examples:
  - "Source: Company 10-K, FY2024, Page 45, Revenue Note, [SEC EDGAR URL]"
  - "Source: Company 10-Q, Q2 2025, Exhibit 99.1, [SEC EDGAR URL]"
  - "Source: Bloomberg Terminal, 8/15/2025, AAPL US Equity"
  - "Source: FactSet, 8/20/2025, Consensus Estimates Screen"

# XLSX creation, editing, and analysis

## Overview

Create, edit, or analyze Excel spreadsheets with formulas, formatting, and data analysis. Apply this skill for spreadsheet processing using openpyxl and pandas. Recalculate formulas and ensure zero errors for publication-quality outputs.

## Visual Enhancement with Scientific Schematics

**When creating documents with this skill, always consider adding scientific diagrams and schematics to enhance visual communication.**

If your document does not already contain schematics or diagrams:
- Use the **scientific-schematics** skill to generate AI-powered publication-quality diagrams
- Simply describe your desired diagram in natural language
- Nano Banana Pro will automatically generate, review, and refine the schematic

**For new documents:** Scientific schematics should be generated by default to visually represent key concepts, workflows, architectures, or relationships described in the text.

**How to generate schematics:**
```bash
python scripts/generate_schematic.py "your diagram description" -o figures/output.png
```

The AI will automatically:
- Create publication-quality images with proper formatting
- Review and refine through multiple iterations
- Ensure accessibility (colorblind-friendly, high contrast)
- Save outputs in the figures/ directory

**When to add schematics:**
- Spreadsheet workflow diagrams
- Data processing pipeline illustrations
- Formula calculation flow diagrams
- Financial model structure diagrams
- Data analysis flowcharts
- Any complex concept that benefits from visualization

For detailed guidance on creating schematics, refer to the scientific-schematics skill documentation.

---

## Important Requirements

**LibreOffice Required for Formula Recalculation**: You can assume LibreOffice is installed for recalculating formula values using the `recalc.py` script. The script automatically configures LibreOffice on first run

## Reading and analyzing data

### Data analysis with pandas
For data analysis, visualization, and basic operations, use **pandas** which provides powerful data manipulation capabilities:

```python
import pandas as pd

# Read Excel
df = pd.read_excel('file.xlsx')  # Default: first sheet
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)  # All sheets as dict

# Analyze
df.head()      # Preview data
df.info()      # Column info
df.describe()  # Statistics

# Write Excel
df.to_excel('output.xlsx', index=False)
```

## Excel File Workflows

## CRITICAL: Use Formulas, Not Hardcoded Values

**Always use Excel formulas instead of calculating values in Python and hardcoding them.** This ensures the spreadsheet remains dynamic and updateable.

### ❌ WRONG - Hardcoding Calculated Values
```python
# Bad: Calculating in Python and hardcoding result
total = df['Sales'].sum()
sheet['B10'] = total  # Hardcodes 5000

# Bad: Computing growth rate in Python
growth = (df.iloc[-1]['Revenue'] - df.iloc[0]['Revenue']) / df.iloc[0]['Revenue']
sheet['C5'] = growth  # Hardcodes 0.15

# Bad: Python calculation for average
avg = sum(values) / len(values)
sheet['D20'] = avg  # Hardcodes 42.5
```

### ✅ CORRECT - Using Excel Formulas
```python
# Good: Let Excel calculate the sum
sheet['B10'] = '=SUM(B2:B9)'

# Good: Growth rate as Excel formula
sheet['C5'] = '=(C4-C2)/C2'

# Good: Average using Excel function
sheet['D20'] = '=AVERAGE(D2:D19)'
```

This applies to ALL calculations - totals, percentages, ratios, differences, etc. The spreadsheet should be able to recalculate when source data changes.

## Common Workflow
1. **Choose tool**: pandas for data, openpyxl for formulas/formatting
2. **Create/Load**: Create new workbook or load existing file
3. **Modify**: Add/edit data, formulas, and formatting
4. **Save**: Write to file
5. **Recalculate formulas (MANDATORY IF USING FORMULAS)**: Use the recalc.py script
   ```bash
   python recalc.py output.xlsx
   ```
6. **Verify and fix any errors**: 
   - The script returns JSON with error details
   - If `status` is `errors_found`, check `error_summary` for specific error types and locations
   - Fix the identified errors and recalculate again
   - Common errors to fix:
     - `#REF!`: Invalid cell references
     - `#DIV/0!`: Division by zero
     - `#VALUE!`: Wrong data type in formula
     - `#NAME?`: Unrecognized formula name

### Creating new Excel files

```python
# Using openpyxl for formulas and formatting
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
sheet = wb.active

# Add data
sheet['A1'] = 'Hello'
sheet['B1'] = 'World'
sheet.append(['Row', 'of', 'data'])

# Add formula
sheet['B2'] = '=SUM(A1:A10)'

# Formatting
sheet['A1'].font = Font(bold=True, color='FF0000')
sheet['A1'].fill = PatternFill('solid', start_color='FFFF00')
sheet['A1'].alignment = Alignment(horizontal='center')

# Column width
sheet.column_dimensions['A'].width = 20

wb.save('output.xlsx')
```

### Editing existing Excel files

```python
# Using openpyxl to preserve formulas and formatting
from openpyxl import load_workbook

# Load existing file
wb = load_workbook('existing.xlsx')
sheet = wb.active  # or wb['SheetName'] for specific sheet

# Working with multiple sheets
for sheet_name in wb.sheetnames:
    sheet = wb[sheet_name]
    print(f"Sheet: {sheet_name}")

# Modify cells
sheet['A1'] = 'New Value'
sheet.insert_rows(2)  # Insert row at position 2
sheet.delete_cols(3)  # Delete column 3

# Add new sheet
new_sheet = wb.create_sheet('NewSheet')
new_sheet['A1'] = 'Data'

wb.save('modified.xlsx')
```

## Recalculating formulas

Excel files created or modified by openpyxl contain formulas as strings but not calculated values. Use the provided `recalc.py` script to recalculate formulas:

```bash
python recalc.py <excel_file> [timeout_seconds]
```

Example:
```bash
python recalc.py output.xlsx 30
```

The script:
- Automatically sets up LibreOffice macro on first run
- Recalculates all formulas in all sheets
- Scans ALL cells for Excel errors (#REF!, #DIV/0!, etc.)
- Returns JSON with detailed error locations and counts
- Works on both Linux and macOS

## Formula Verification Checklist

Quick checks to ensure formulas work correctly:

### Essential Verification
- [ ] **Test 2-3 sample references**: Verify they pull correct values before building full model
- [ ] **Column mapping**: Confirm Excel columns match (e.g., column 64 = BL, not BK)
- [ ] **Row offset**: Remember Excel rows are 1-indexed (DataFrame row 5 = Excel row 6)

### Common Pitfalls
- [ ] **NaN handling**: Check for null values with `pd.notna()`
- [ ] **Far-right columns**: FY data often in columns 50+ 
- [ ] **Multiple matches**: Search all occurrences, not just first
- [ ] **Division by zero**: Check denominators before using `/` in formulas (#DIV/0!)
- [ ] **Wrong references**: Verify all cell references point to intended cells (#REF!)
- [ ] **Cross-sheet references**: Use correct format (Sheet1!A1) for linking sheets

### Formula Testing Strategy
- [ ] **Start small**: Test formulas on 2-3 cells before applying broadly
- [ ] **Verify dependencies**: Check all cells referenced in formulas exist
- [ ] **Test edge cases**: Include zero, negative, and very large values

### Interpreting recalc.py Output
The script returns JSON with error details:
```json
{
  "status": "success",           // or "errors_found"
  "total_errors": 0,              // Total error count
  "total_formulas": 42,           // Number of formulas in file
  "error_summary": {              // Only present if errors found
    "#REF!": {
      "count": 2,
      "locations": ["Sheet1!B5", "Sheet1!C10"]
    }
  }
}
```

## Best Practices

### Library Selection
- **pandas**: Best for data analysis, bulk operations, and simple data export
- **openpyxl**: Best for complex formatting, formulas, and Excel-specific features

### Working with openpyxl
- Cell indices are 1-based (row=1, column=1 refers to cell A1)
- Use `data_only=True` to read calculated values: `load_workbook('file.xlsx', data_only=True)`
- **Warning**: If opened with `data_only=True` and saved, formulas are replaced with values and permanently lost
- For large files: Use `read_only=True` for reading or `write_only=True` for writing
- Formulas are preserved but not evaluated - use recalc.py to update values

### Working with pandas
- Specify data types to avoid inference issues: `pd.read_excel('file.xlsx', dtype={'id': str})`
- For large files, read specific columns: `pd.read_excel('file.xlsx', usecols=['A', 'C', 'E'])`
- Handle dates properly: `pd.read_excel('file.xlsx', parse_dates=['date_column'])`

## Code Style Guidelines
**IMPORTANT**: When generating Python code for Excel operations:
- Write minimal, concise Python code without unnecessary comments
- Avoid verbose variable names and redundant operations
- Avoid unnecessary print statements

**For Excel files themselves**:
- Add comments to cells with complex formulas or important assumptions
- Document data sources for hardcoded values
- Include notes for key calculations and model sections

---

## Wiki Compile (post-delivery)

After delivering the output, compile durable findings to the Knowledge Wiki. Read `context/wiki-compile-step.md` for the full checklist. Skip if the output is formatting-only or contains no new findings (apply the "so what" test).