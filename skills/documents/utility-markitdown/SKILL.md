---
name: utility-markitdown
description: Convert documents (PDF, DOCX, XLSX, PPTX, images, HTML, CSV, JSON, XML, ZIP, EPUB, YouTube) into clean Markdown so Claude can actually read their contents. Primary trigger — Jacob drops a Word / Excel / PowerPoint / PDF into a `4 - Projects/[name]/` folder to kick off project work; Claude must convert it first before doing anything else, otherwise it can't read the source. Also use whenever Jacob asks to "extract", "read", "summarise", "pull from", "what does this say", or just shares a non-text file path expecting Claude to engage with the contents. Does NOT handle voice / audio (use utility-transcribe — different pipeline, pushes to Notion). Does NOT create or edit documents (use documents-docx / documents-pptx / documents-davila7-xlsx / documents-pdf for authoring).
---

# utility-markitdown

Microsoft's [MarkItDown](https://github.com/microsoft/markitdown), installed as a CLI. Turns binary documents into plain Markdown so their content can be read, quoted, analysed, or fed into downstream skills.

## The workflow this skill is built for

Jacob's standard ingest pattern:

1. **He drops a source file into a project folder** — typically `4 - Projects/[project-name]/raw/` (or sometimes loose in the project root if the project is fresh). The source is usually `.docx`, `.pptx`, `.xlsx`, or `.pdf`.
2. **He asks Claude to do something with it** — analyse, summarise, draft a response, extract a table, etc. Sometimes he just says "have a look" or refers to the file by name.
3. **Claude can't read the binary directly.** This skill is the gate: convert the source to `.md` first, *then* do the work.

Voice files follow a different pipeline — they go in `5 - Voice Files/` and are handled by `utility-transcribe` (Whisper + Notion push). Don't use markitdown for audio.

## Default convention — where the .md lives

Inside a project folder, follow the existing Analyst structure:

| Source file lives in… | Write the converted `.md` to… |
|---|---|
| `4 - Projects/[name]/raw/source.docx` | `4 - Projects/[name]/cleaned/source.md` |
| `4 - Projects/[name]/source.docx` (loose) | `4 - Projects/[name]/cleaned/source.md` (create `cleaned/` if missing) |
| Outside a project folder | Sibling to the source: `source.docx` → `source.md` |

If `cleaned/` doesn't exist yet, create it. Then append a `## Ingest — [date]` entry to the project's `log.md` (per the project log convention) noting:
- Source file (path, file size, page/sheet/slide count if known)
- Output `.md` path
- Anything markitdown failed on (scanned PDF pages, complex tables, etc.)

For one-off / outside-a-project conversions, skip the log step.

## Usage

Installed binary: `/Users/jacob/.local/bin/markitdown` (on PATH, just `markitdown`).

### Convert a single file → save alongside

```bash
markitdown "/path/to/source.docx" -o "/path/to/cleaned/source.md"
```

This is the default for project work. Always use `-o` rather than piping to stdout for project ingest — it gives you a re-readable artefact and avoids dumping huge content into the conversation.

### Convert and read inline (small files only)

```bash
markitdown "/path/to/short.docx"
```

Only for small files where the full content is needed in the conversation immediately. For anything more than ~200 lines, write to a file and `Read` it.

### Convert a folder of dropped files

When Jacob drops several files into a project, batch them:

```bash
cd "/Users/jacob/Documents/The-Analyst/4 - Projects/[project-name]"
mkdir -p cleaned
for f in raw/*.{docx,pptx,xlsx,pdf}; do
  [ -e "$f" ] || continue
  out="cleaned/$(basename "${f%.*}").md"
  markitdown "$f" -o "$out"
done
```

### Python API (only when CLI won't do)

```python
from markitdown import MarkItDown
text = MarkItDown().convert("/path/to/file.pdf").text_content
```

For LLM-assisted image captions inside PPTX or image files, pass an `OpenAI` client with `llm_model="gpt-4o"`. Rarely needed for routine ingest.

## Supported formats

PDF, PowerPoint (.pptx), Word (.docx), Excel (.xlsx / .xls), images (EXIF + OCR), HTML, CSV, JSON, XML, ZIP (iterates contents), YouTube URLs, EPUB, Outlook `.msg`. Skip audio — use `utility-transcribe`.

## Gotchas

- **Python version.** markitdown needs Python 3.10+; the project `.venv` is 3.9. Don't `pip install markitdown` into the project venv — it silently resolves to a stale 0.0.1a1 alpha. The CLI installed via `uv tool install` is the only correct entry point.
- **Scanned PDFs.** Built-in PDF converter is text-layer only. If the result is empty or gibberish, the PDF is scanned — flag this to Jacob and offer Azure Document Intelligence (`-d -e "<endpoint>"`) or another OCR step.
- **Excel fidelity.** Cells convert to Markdown tables — formulas are evaluated values, not formulas. If the *structure* of the workbook matters (formulas, named ranges, cell references), use `documents-davila7-xlsx` instead of markitdown.
- **PowerPoint speaker notes.** Captured. Slide images are not described unless `llm_client` is wired in via the Python API.
- **Encoding in stdout.** Some shells mangle em dashes / smart quotes when piped. If the conversation shows `‚Äî` instead of `—`, write to a file with `-o` and `Read` it — the file itself is fine.
- **Large files.** Always use `-o` for files that would produce more than a few hundred lines of markdown. Dumping megabytes into a conversation wastes context.
- **YouTube.** Pass URL directly: `markitdown "https://youtu.be/..."`. Returns the transcript if one exists.

## Reinstall / upgrade

```bash
uv tool upgrade markitdown
# or
uv tool install --reinstall 'markitdown[all]' --python 3.12
```

## Triggers — when to reach for this skill

- Jacob says: "have a look at [file]", "what does this say", "summarise this deck", "pull the key terms", "extract the table from", "convert to markdown", "markitdown this".
- A file path with `.docx` / `.pptx` / `.xlsx` / `.pdf` appears in a request and the task requires reading the contents.
- A project folder under `4 - Projects/` has new non-text files in `raw/` (or loose in the project root) that haven't been converted yet, and Jacob is asking Claude to act on them.
- Scenarios where the next skill (`analysis-commercial-insight`, `analysis-scenario-model`, `intelligence-market-intel`, etc.) needs the source as text — markitdown is the upstream conversion step.

## When NOT to use

- Audio file → `utility-transcribe`.
- File is already `.md` / `.txt` / `.csv` / `.sql` / source code → just `Read` it.
- Need to *create* or *edit* a document → `documents-docx` / `documents-pptx` / `documents-davila7-xlsx` / `documents-pdf`.
- Need full visual fidelity (layout, fonts, colours) preserved — markitdown is lossy on visual formatting.
