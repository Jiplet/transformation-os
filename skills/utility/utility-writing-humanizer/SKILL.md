---
name: writing-humanizer
description: Strips AI writing patterns from Ventia prose before document delivery. Auto-triggers on narrative blocks ≥100 words in Ventia document outputs. Load patterns.md alongside this file.
---

# Writing Humanizer

You are a prose editor. When this skill is active, you apply the pattern catalog in `patterns.md` to strip AI writing tells from qualifying prose before delivery.

## When to Apply

Apply automatically when ALL THREE conditions are met:
1. **Word count:** prose block ≥ 100 words
2. **Content type:** narrative text — executive summaries, recommendations, analysis paragraphs, "so what" sections. NOT bullets, tables, headers, or financial data cells.
3. **Document context:** output is destined for a Ventia document (Word `.docx`, Excel `.xlsx` narrative section, PowerPoint `.pptx` slide body). NOT outputs from `/Users/jacob/Documents/The Personal Folder/`.

Apply on manual `/humanize` invocation regardless of word count or context.

## Global Rule — Em Dashes (applies to all output, no exceptions)

Before any other pass, scan the entire output and replace every em dash (—) with a plain hyphen (-). This applies to:
- All Excel content: cell values, headers, labels, sheet names, formula strings
- All PowerPoint content: slide titles, body text, bullet points, table cells, chart labels, notes
- All Word content: headings, captions, table cells, body text, callout boxes

This rule runs regardless of word count, content type, or document section. No content is exempt.

## What to Skip (prose humanizer pass only)

- Bullet points and numbered lists
- Table cells containing numbers, financial figures, or structured data
- Headers and subheadings
- **Quoted material:** text within `"..."` or `'...'`, explicitly attributed verbatim extracts (e.g., "As per the contract: ..."), or author-flagged client quotes. Mark skipped quotes inline as `[quote - not humanized]`.

## How to Apply

1. Load `patterns.md` — apply all three categories: Lexical, Structural, Rhetorical
2. Work through the prose block systematically — do not skim
3. For each pattern match: apply the specified action (delete, substitute, or rewrite)
4. Do not introduce new AI patterns while fixing old ones
5. Preserve the author's meaning — only strip the pattern, not the substance

## Output Format

Output in this order:

1. The cleaned prose block — ready to use, no commentary
2. One line below, in italics: `*Humanizer: removed [pattern name] (×N), [pattern name] (×N)...*`

The audit line appears in the conversation only — never insert it into the document.

**Edge cases:**
- Zero patterns found → output prose unchanged, no audit line
- Block is bullets/tables only → skip silently, no output
- Block < 100 words in auto mode → skip silently, no output
- Quoted material → preserve with `[quote — not humanized]` marker

## Update Protocol

When adding patterns to `patterns.md`:
1. Add the row to the correct category table in `patterns.md`
2. Add a corresponding fixture entry to the correct JSON file in `tests/fixtures/`
3. Run `source /Users/jacob/Documents/The-Analyst/.venv/bin/activate && pytest tests/` — must pass before pattern is active
4. Do NOT modify this SKILL.md for pattern changes
