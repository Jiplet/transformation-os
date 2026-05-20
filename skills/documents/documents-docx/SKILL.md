---
name: docx
description: "Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation."
license: Proprietary. LICENSE.txt has complete terms
---

# DOCX creation, editing, and analysis

## CRITICAL: Use python-docx only

**Never use docx-js (JavaScript) for creating new documents.** docx-js output will not open in Word for Mac. Always use `python-docx` via the project venv:

```bash
source /Users/jacob/Documents/The-Analyst/.venv/bin/activate && python3 - << 'PYEOF'
from docx import Document
# ... build document ...
doc.save("output.docx")
PYEOF
```

---

## Ventia Brand Standards

**Apply Ventia styling to all new Ventia Word documents unless the file has an established template.**

### Colour Palette

| Role | Name | Hex | Python constant |
|---|---|---|---|
| Primary | Dark Navy | 0B3254 | `NAVY = RGBColor(0x0B, 0x32, 0x54)` |
| Secondary | Bright Blue | 13B5EA | `BLUE = RGBColor(0x13, 0xB5, 0xEA)` |
| Tertiary | Light Blue | B1DAF6 | `LIGHT_BLUE = RGBColor(0xB1, 0xDA, 0xF6)` |
| Highlight | Purple | 95358C | `PURPLE = RGBColor(0x95, 0x35, 0x8C)` |
| Positive | Dark Green | 006E47 | `DARK_GREEN = RGBColor(0x00, 0x6E, 0x47)` |
| Positive (alt) | Green | 009946 | `GREEN = RGBColor(0x00, 0x99, 0x46)` |
| Positive (light) | Light Green | 7BC143 | `LIGHT_GREEN = RGBColor(0x7B, 0xC1, 0x43)` |
| Neutral BG | Light Grey | E6EAEE | `LIGHT_GREY = "E6EAEE"` (hex string for shading) |
| Muted | Grey Blue | 8598A9 | `GREY_BLUE = RGBColor(0x85, 0x98, 0xA9)` |
| Text | Black | 000000 | `BLACK = RGBColor(0, 0, 0)` |
| Background | White | FFFFFF | `WHITE = "FFFFFF"` (hex string for shading) |

Paste these constants at the top of any build script:
```python
from docx.shared import RGBColor, Pt, Cm, Inches, Emu
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.enum.text import WD_ALIGN_PARAGRAPH

NAVY = RGBColor(0x0B, 0x32, 0x54)
BLUE = RGBColor(0x13, 0xB5, 0xEA)
LIGHT_BLUE = RGBColor(0xB1, 0xDA, 0xF6)
PURPLE = RGBColor(0x95, 0x35, 0x8C)
DARK_GREEN = RGBColor(0x00, 0x6E, 0x47)
GREEN = RGBColor(0x00, 0x99, 0x46)
LIGHT_GREEN = RGBColor(0x7B, 0xC1, 0x43)
GREY_BLUE = RGBColor(0x85, 0x98, 0xA9)
```

### Cover Page Pattern

Every Ventia Word document MUST include a styled cover page as page 1.

**Cover content — in this order:**
1. **Ventia logo** — top-left. Path: `/Users/jacob/Documents/The-Analyst/Template/ventia_logo.png`
2. **Report title** — large, navy text (~24pt bold)
3. **Subtitle / date** — Bright Blue text (~12pt)
4. **Blue rule divider** — Bright Blue horizontal line (paragraph bottom border)
5. **Synopsis** — max 2 plain-English sentences stating the hypothesis and approach. No AI-sounding language ("this analysis leverages...", "comprehensive review..."). Write like you're briefing a project director over coffee. Follow with dot-point key findings.
6. **Assumptions** — clearly listed. Every assumption must be verified with the user during planning. If unverified, prefix with "Unverified:". Never assume silently.
7. **How to Read This Document** — list each section with a one-line description of what it contains and what to look for. This is for stakeholders receiving the handover.

```python
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

LOGO_PATH = "/Users/jacob/Documents/The-Analyst/Template/ventia_logo.png"
NAVY = RGBColor(0x0B, 0x32, 0x54)
BLUE = RGBColor(0x13, 0xB5, 0xEA)

doc = Document()

# --- Default font ---
style = doc.styles['Normal']
style.font.name = 'Arial'
style.font.size = Pt(10.5)

# --- Page margins ---
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)

# --- 1. Ventia logo ---
doc.add_picture(LOGO_PATH, width=Cm(3))

# --- 2. Report title (navy, 24pt bold) ---
title_para = doc.add_paragraph()
title_run = title_para.add_run("Report Title Here")
title_run.bold = True
title_run.font.size = Pt(24)
title_run.font.color.rgb = NAVY
title_run.font.name = 'Arial'

# --- 3. Subtitle / date (Bright Blue, 12pt) ---
sub_para = doc.add_paragraph()
sub_run = sub_para.add_run("Subtitle or date here")
sub_run.font.size = Pt(12)
sub_run.font.color.rgb = BLUE
sub_run.font.name = 'Arial'

# --- 4. Blue rule divider (paragraph bottom border) ---
def add_bottom_border(paragraph, color="13B5EA", size="6"):
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), size)
    bottom.set(qn('w:color'), color)
    bottom.set(qn('w:space'), '1')
    pBdr.append(bottom)
    pPr.append(pBdr)

rule_para = doc.add_paragraph()
add_bottom_border(rule_para)

# --- 5. Synopsis ---
syn_heading = doc.add_paragraph()
syn_run = syn_heading.add_run("Synopsis")
syn_run.bold = True
syn_run.font.size = Pt(12)
syn_run.font.color.rgb = NAVY

doc.add_paragraph("Plain-English synopsis here — 1-2 sentences, then key findings below.")
# Add bullet findings using doc.add_paragraph("Finding text", style='List Bullet')

# --- 6. Assumptions ---
asm_heading = doc.add_paragraph()
asm_run = asm_heading.add_run("Assumptions")
asm_run.bold = True
asm_run.font.size = Pt(12)
asm_run.font.color.rgb = NAVY

# --- 7. How to Read This Document ---
htr_heading = doc.add_paragraph()
htr_run = htr_heading.add_run("How to Read This Document")
htr_run.bold = True
htr_run.font.size = Pt(12)
htr_run.font.color.rgb = NAVY

# --- Page break after cover ---
doc.add_page_break()

# ... body content follows ...
doc.save("output.docx")
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
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Pt, RGBColor

def set_cell_shading(cell, fill_hex):
    """Set cell background colour. Use hex string without #."""
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), fill_hex)
    shading.set(qn('w:val'), 'clear')
    cell._tc.get_or_add_tcPr().append(shading)

def style_header_row(row):
    """Navy background, white bold text for header row."""
    for cell in row.cells:
        set_cell_shading(cell, '0B3254')
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                run.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                run.font.size = Pt(11)
                run.font.name = 'Arial'

def style_data_rows(table, start_row=1):
    """Alternating white/light grey rows, 10pt text."""
    for i, row in enumerate(table.rows[start_row:], start=start_row):
        fill = 'FFFFFF' if (i - start_row) % 2 == 0 else 'E6EAEE'
        for cell in row.cells:
            set_cell_shading(cell, fill)
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(10)
                    run.font.name = 'Arial'

# Usage:
table = doc.add_table(rows=4, cols=3)
style_header_row(table.rows[0])
style_data_rows(table)
```

### Tone Guidance

- Write like you're briefing a project director over coffee
- No AI-sounding language: avoid "leverages", "comprehensive", "robust", "cutting-edge"
- **Never use em dashes (—).** Use a colon, comma, or rewrite the sentence instead.
- Surface the "so what" first, then the detail
- Bullet points and tables over prose for structured information
- Positive variance → Green (`009946`). Negative variance → Purple (`95358C`).

---

## Overview

A .docx file is a ZIP archive containing XML files.

## Quick Reference

| Task | Approach |
|------|----------|
| Read/analyze content | `pandoc` or unpack for raw XML |
| Create new document | Use `python-docx` (NEVER docx-js) - see Creating New Documents below |
| Edit existing document | Unpack → edit XML → repack - see Editing Existing Documents below |

### Converting .doc to .docx

Legacy `.doc` files must be converted before editing:

```bash
python scripts/office/soffice.py --headless --convert-to docx document.doc
```

### Reading Content

```bash
# Text extraction with tracked changes
pandoc --track-changes=all document.docx -o output.md

# Raw XML access
python scripts/office/unpack.py document.docx unpacked/
```

### Converting to Images

```bash
python scripts/office/soffice.py --headless --convert-to pdf document.docx
pdftoppm -jpeg -r 150 document.pdf page
```

### Accepting Tracked Changes

To produce a clean document with all tracked changes accepted (requires LibreOffice):

```bash
python scripts/accept_changes.py input.docx output.docx
```

---

## Creating New Documents

**Always use python-docx. Never use docx-js — output will not open in Word for Mac.**

Run via the project venv as an inline heredoc:
```bash
source /Users/jacob/Documents/The-Analyst/.venv/bin/activate && python3 - << 'PYEOF'
# ... full script here ...
PYEOF
```

### Setup
```python
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document()

# Set default font
style = doc.styles['Normal']
style.font.name = 'Arial'
style.font.size = Pt(10.5)

# Set page margins (2.5cm standard for Ventia)
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)
```

### Page Size

```python
from docx.shared import Cm, Inches

section = doc.sections[0]

# A4 (python-docx default — correct for Ventia/AU)
section.page_width = Cm(21.0)
section.page_height = Cm(29.7)

# US Letter (if needed)
section.page_width = Inches(8.5)
section.page_height = Inches(11)

# Landscape — swap width and height
from docx.enum.section import WD_ORIENT
section.orientation = WD_ORIENT.LANDSCAPE
section.page_width = Cm(29.7)
section.page_height = Cm(21.0)
```

### Headings

```python
# Headings with navy colour
heading = doc.add_heading("Section Title", level=1)
for run in heading.runs:
    run.font.color.rgb = RGBColor(0x0B, 0x32, 0x54)
    run.font.name = 'Arial'

# Or build manually for full control
para = doc.add_paragraph()
run = para.add_run("Section Title")
run.bold = True
run.font.size = Pt(14)
run.font.color.rgb = RGBColor(0x0B, 0x32, 0x54)
run.font.name = 'Arial'
```

### Lists

```python
# Bullet list
doc.add_paragraph("First item", style='List Bullet')
doc.add_paragraph("Second item", style='List Bullet')

# Numbered list
doc.add_paragraph("Step one", style='List Number')
doc.add_paragraph("Step two", style='List Number')

# Bold lead-in with regular continuation (for recommendations)
para = doc.add_paragraph(style='List Number')
bold_run = para.add_run("Resolve the IRA variance first. ")
bold_run.bold = True
para.add_run("This is a commercial penalty risk. Work with Brad McCotter...")
```

### Tables

```python
# Create table
table = doc.add_table(rows=4, cols=3)
table.alignment = WD_TABLE_ALIGNMENT.CENTER

# Set column widths
for row in table.rows:
    row.cells[0].width = Cm(4)
    row.cells[1].width = Cm(4)
    row.cells[2].width = Cm(8)

# Populate
table.rows[0].cells[0].text = "Column A"
table.rows[0].cells[1].text = "Column B"
table.rows[0].cells[2].text = "Column C"

# Style with Ventia helpers (see Table Formatting Standards above)
style_header_row(table.rows[0])
style_data_rows(table)
```

### Images

```python
# Add image with specified width (height auto-scales)
doc.add_picture("/path/to/image.png", width=Cm(3))

# Add image to a specific paragraph (e.g., inline)
para = doc.add_paragraph()
run = para.add_run()
run.add_picture("/path/to/image.png", width=Cm(5))
```

### Page Breaks

```python
doc.add_page_break()

# Or force a page break before a paragraph
para = doc.add_paragraph("New page content")
para.paragraph_format.page_break_before = True
```

### Headers and Footers

```python
section = doc.sections[0]
section.different_first_page_header_footer = False

# Footer
footer = section.footer
footer.is_linked_to_previous = False
footer_para = footer.paragraphs[0]
footer_para.alignment = WD_ALIGN_PARAGRAPH.RIGHT
footer_run = footer_para.add_run("INTERNAL — Ventia")
footer_run.font.size = Pt(8)
footer_run.font.color.rgb = RGBColor(0x85, 0x98, 0xA9)

# Header
header = section.header
header.is_linked_to_previous = False
header_para = header.paragraphs[0]
header_run = header_para.add_run("Document Title")
header_run.font.size = Pt(8)
```

### Horizontal Rules (Paragraph Borders)

```python
def add_bottom_border(paragraph, color="13B5EA", size="6"):
    """Add a coloured bottom border to a paragraph (acts as a divider)."""
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), size)
    bottom.set(qn('w:color'), color)
    bottom.set(qn('w:space'), '1')
    pBdr.append(bottom)
    pPr.append(pBdr)

# Usage — never use a table as a divider
rule = doc.add_paragraph()
add_bottom_border(rule)
```

### Cell Shading (OxmlElement pattern)

```python
def set_cell_shading(cell, fill_hex):
    """Set cell background. Pass hex string without #, e.g. '0B3254'."""
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), fill_hex)
    shading.set(qn('w:val'), 'clear')
    cell._tc.get_or_add_tcPr().append(shading)
```

### Critical Rules for python-docx

- **Always use python-docx** — never docx-js (output won't open in Word for Mac)
- **Run via project venv** — `source .venv/bin/activate && python3 - << 'PYEOF' ... PYEOF`
- **Every new Ventia doc gets a cover page** — logo, title, subtitle, blue rule, synopsis, assumptions, how-to-read, then page break
- **Default font is Arial** — set on `doc.styles['Normal']` at the start of every script
- **Use `'List Bullet'` and `'List Number'` styles** — never manually insert bullet unicode characters
- **Use `OxmlElement` for shading** — python-docx has no native cell shading API; use `set_cell_shading()` helper
- **Use paragraph borders for dividers** — never use empty tables as horizontal rules
- **Page breaks** — use `doc.add_page_break()`, not `\n` or empty paragraphs
- **Heading colours** — python-docx headings default to black; always set `run.font.color.rgb = NAVY` after adding
- **Table widths** — set `cell.width` on every cell in every row for consistent rendering
- **Spacing** — use `paragraph.paragraph_format.space_before = Pt(X)` and `space_after = Pt(X)` for control

---

## Editing Existing Documents

**Follow all 3 steps in order.**

### Step 1: Unpack
```bash
python scripts/office/unpack.py document.docx unpacked/
```
Extracts XML, pretty-prints, merges adjacent runs, and converts smart quotes to XML entities (`&#x201C;` etc.) so they survive editing. Use `--merge-runs false` to skip run merging.

### Step 2: Edit XML

Edit files in `unpacked/word/`. See XML Reference below for patterns.

**Use "Claude" as the author** for tracked changes and comments, unless the user explicitly requests use of a different name.

**Use the Edit tool directly for string replacement. Do not write Python scripts.** Scripts introduce unnecessary complexity. The Edit tool shows exactly what is being replaced.

**CRITICAL: Use smart quotes for new content.** When adding text with apostrophes or quotes, use XML entities to produce smart quotes:
```xml
<!-- Use these entities for professional typography -->
<w:t>Here&#x2019;s a quote: &#x201C;Hello&#x201D;</w:t>
```
| Entity | Character |
|--------|-----------|
| `&#x2018;` | ‘ (left single) |
| `&#x2019;` | ’ (right single / apostrophe) |
| `&#x201C;` | “ (left double) |
| `&#x201D;` | ” (right double) |

**Adding comments:** Use `comment.py` to handle boilerplate across multiple XML files (text must be pre-escaped XML):
```bash
python scripts/comment.py unpacked/ 0 "Comment text with &amp; and &#x2019;"
python scripts/comment.py unpacked/ 1 "Reply text" --parent 0  # reply to comment 0
python scripts/comment.py unpacked/ 0 "Text" --author "Custom Author"  # custom author name
```
Then add markers to document.xml (see Comments in XML Reference).

### Step 3: Pack
```bash
python scripts/office/pack.py unpacked/ output.docx --original document.docx
```
Validates with auto-repair, condenses XML, and creates DOCX. Use `--validate false` to skip.

**Auto-repair will fix:**
- `durableId` >= 0x7FFFFFFF (regenerates valid ID)
- Missing `xml:space="preserve"` on `<w:t>` with whitespace

**Auto-repair won't fix:**
- Malformed XML, invalid element nesting, missing relationships, schema violations

### Common Pitfalls

- **Replace entire `<w:r>` elements**: When adding tracked changes, replace the whole `<w:r>...</w:r>` block with `<w:del>...<w:ins>...` as siblings. Don't inject tracked change tags inside a run.
- **Preserve `<w:rPr>` formatting**: Copy the original run's `<w:rPr>` block into your tracked change runs to maintain bold, font size, etc.

---

## XML Reference

### Schema Compliance

- **Element order in `<w:pPr>`**: `<w:pStyle>`, `<w:numPr>`, `<w:spacing>`, `<w:ind>`, `<w:jc>`, `<w:rPr>` last
- **Whitespace**: Add `xml:space="preserve"` to `<w:t>` with leading/trailing spaces
- **RSIDs**: Must be 8-digit hex (e.g., `00AB1234`)

### Tracked Changes

**Insertion:**
```xml
<w:ins w:id="1" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:t>inserted text</w:t></w:r>
</w:ins>
```

**Deletion:**
```xml
<w:del w:id="2" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:delText>deleted text</w:delText></w:r>
</w:del>
```

**Inside `<w:del>`**: Use `<w:delText>` instead of `<w:t>`, and `<w:delInstrText>` instead of `<w:instrText>`.

**Minimal edits** - only mark what changes:
```xml
<!-- Change "30 days" to "60 days" -->
<w:r><w:t>The term is </w:t></w:r>
<w:del w:id="1" w:author="Claude" w:date="...">
  <w:r><w:delText>30</w:delText></w:r>
</w:del>
<w:ins w:id="2" w:author="Claude" w:date="...">
  <w:r><w:t>60</w:t></w:r>
</w:ins>
<w:r><w:t> days.</w:t></w:r>
```

**Deleting entire paragraphs/list items** - when removing ALL content from a paragraph, also mark the paragraph mark as deleted so it merges with the next paragraph. Add `<w:del/>` inside `<w:pPr><w:rPr>`:
```xml
<w:p>
  <w:pPr>
    <w:numPr>...</w:numPr>  <!-- list numbering if present -->
    <w:rPr>
      <w:del w:id="1" w:author="Claude" w:date="2025-01-01T00:00:00Z"/>
    </w:rPr>
  </w:pPr>
  <w:del w:id="2" w:author="Claude" w:date="2025-01-01T00:00:00Z">
    <w:r><w:delText>Entire paragraph content being deleted...</w:delText></w:r>
  </w:del>
</w:p>
```
Without the `<w:del/>` in `<w:pPr><w:rPr>`, accepting changes leaves an empty paragraph/list item.

**Rejecting another author's insertion** - nest deletion inside their insertion:
```xml
<w:ins w:author="Jane" w:id="5">
  <w:del w:author="Claude" w:id="10">
    <w:r><w:delText>their inserted text</w:delText></w:r>
  </w:del>
</w:ins>
```

**Restoring another author's deletion** - add insertion after (don't modify their deletion):
```xml
<w:del w:author="Jane" w:id="5">
  <w:r><w:delText>deleted text</w:delText></w:r>
</w:del>
<w:ins w:author="Claude" w:id="10">
  <w:r><w:t>deleted text</w:t></w:r>
</w:ins>
```

### Comments

After running `comment.py` (see Step 2), add markers to document.xml. For replies, use `--parent` flag and nest markers inside the parent's.

**CRITICAL: `<w:commentRangeStart>` and `<w:commentRangeEnd>` are siblings of `<w:r>`, never inside `<w:r>`.**

```xml
<!-- Comment markers are direct children of w:p, never inside w:r -->
<w:commentRangeStart w:id="0"/>
<w:del w:id="1" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:delText>deleted</w:delText></w:r>
</w:del>
<w:r><w:t> more text</w:t></w:r>
<w:commentRangeEnd w:id="0"/>
<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="0"/></w:r>

<!-- Comment 0 with reply 1 nested inside -->
<w:commentRangeStart w:id="0"/>
  <w:commentRangeStart w:id="1"/>
  <w:r><w:t>text</w:t></w:r>
  <w:commentRangeEnd w:id="1"/>
<w:commentRangeEnd w:id="0"/>
<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="0"/></w:r>
<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="1"/></w:r>
```

### Images

1. Add image file to `word/media/`
2. Add relationship to `word/_rels/document.xml.rels`:
```xml
<Relationship Id="rId5" Type=".../image" Target="media/image1.png"/>
```
3. Add content type to `[Content_Types].xml`:
```xml
<Default Extension="png" ContentType="image/png"/>
```
4. Reference in document.xml:
```xml
<w:drawing>
  <wp:inline>
    <wp:extent cx="914400" cy="914400"/>  <!-- EMUs: 914400 = 1 inch -->
    <a:graphic>
      <a:graphicData uri=".../picture">
        <pic:pic>
          <pic:blipFill><a:blip r:embed="rId5"/></pic:blipFill>
        </pic:pic>
      </a:graphicData>
    </a:graphic>
  </wp:inline>
</w:drawing>
```

---

## Dependencies

- **pandoc**: Text extraction
- **docx**: `npm install -g docx` (new documents)
- **LibreOffice**: PDF conversion (auto-configured for sandboxed environments via `scripts/office/soffice.py`)
- **Poppler**: `pdftoppm` for images

---

## Wiki Compile (post-delivery)

After delivering the output, compile durable findings to the Knowledge Wiki. Read `context/wiki-compile-step.md` for the full checklist. Skip if the output is formatting-only or contains no new findings (apply the "so what" test).
