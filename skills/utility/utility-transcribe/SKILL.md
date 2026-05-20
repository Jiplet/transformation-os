---
name: utility-transcribe
description: Transcribe voice memos and audio recordings using OpenAI Whisper, then structure and write to the Obsidian wiki (99-Voice notes folder). Two modes — (1) Single-file: user drops an audio path or says "transcribe this", "voice memo". (2) Scan inbox: user says "process voice memos", "any new memos", "scan voice folder" — processes every audio file in the Google Drive inbox folder and moves each to processed/ after success. Also trigger when the user asks to capture a meeting or conversation from audio.
---

# Voice Memo Transcriber

Transcribes audio using OpenAI Whisper, structures it into meeting notes, and writes one markdown file per memo to the Obsidian wiki.

## Inbox folder (scan mode)

`/Users/<user>/Library/CloudStorage/GoogleDrive-<your-email>@gmail.com/My Drive/99 Voice memos`

Voice files arrive here automatically via Samsung → Autosync → Google Drive → Drive Desktop on Mac. After a successful wiki write, files move to the `processed/` subfolder so the inbox always shows pending work.

## Output target

Voice notes are written as markdown files to:

`/Users/jacob/Documents/The-Analyst/1 - Knowledge/99-Voice notes/`

One file per memo. Filename: `YYYY-MM-DD - <slug>.md` (5–8 word slug derived from the BLUF). YAML frontmatter so Dataview / search-by-area works.

## Step 0 — Determine mode

| Trigger | Mode | Action |
|---|---|---|
| User supplies a specific file path | **Single-file** | Use that path, run Steps 1–4 once |
| "process voice memos", "any new memos", "scan voice folder", "new memos to process" | **Scan inbox** | List audio files in inbox root (NOT in `processed/`), run Steps 1–4 for each, in mtime order (oldest first) |

If scan mode finds no audio files in the inbox, tell the user "Inbox is empty" and stop.

## Step 1 — Get the transcript

**Check the file extension first:**

| Extension | Action |
|---|---|
| `.m4a` `.mp3` `.mp4` `.wav` `.webm` `.ogg` `.mpeg` `.mpga` | Run the transcription script (see below) |
| `.txt` | Read the file directly with the Read tool |
| `.docx` | Extract text: `source /Users/jacob/Documents/The-Analyst/.venv/bin/activate && python3 -c "import docx; print('\n'.join([p.text for p in docx.Document('PATH').paragraphs]))"` |
| Pasted text in chat | Use as-is — skip to Step 2 |

**For audio files**, run the transcription script:

```bash
source /Users/jacob/Documents/The-Analyst/.venv/bin/activate && \
python3 /Users/jacob/Documents/The-Analyst/.claude/skills/utility-transcribe/scripts/transcribe.py "<audio_file_path>"
```

If the venv doesn't have `openai` or `requests`, install first:
```bash
pip install openai requests
```

## Step 2 — Determine output mode

Check the user's request for a mode flag. Default to **Summary** if not specified.

| Flag | Mode | Use when |
|---|---|---|
| `--summary` or no flag | **Summary** | Quick capture — what happened, what's next |
| `--detailed` | **Detailed** | Deep technical/strategic content — methodology, systems, recommendations needed |

---

### Summary mode

Produce this structure. Be concise and executive-ready throughout.

#### Summary (BLUF)
2–3 sentences. Lead with the single most important point. What was decided or what matters most?

#### Actions
Bullet list. Each item: what, who (if named), by when (if stated). Use "TBC" if unclear.

#### Discussion & Notes
Full context in cleaned prose. Remove filler, preserve substance. Organise by topic if multiple threads.

#### Risks & Blockers
Bullet list. Only include if genuinely present in the recording — don't fabricate. If none, write "None identified."

#### Stakeholder Pulse
1–2 lines per person mentioned. Tone, position, concerns, alignment. If no named stakeholders, omit this section.

---

### Detailed mode

Use when the recording contains technical depth, methodology, systems context, or analysis recommendations that would be lost in a summary. Produce an expanded structure:

#### Summary (BLUF)
2–3 sentences. Lead with the single most important point.

#### Actions
Bullet list. Each item: what, who, by when. Use "TBC" if unclear.

#### Discussion & Notes
Expand each topic thread fully. Include:
- Background and context
- System/data landscape (tools, sources, access status)
- What's measurable vs not — and why
- Recommended analysis approach (phased if appropriate)
- Data requirements and access blockers

#### Risks & Blockers
Bullet list. Flag structural, data, access, and timeline risks explicitly.

#### Stakeholder Pulse
1–2 lines per person. Tone, position, concerns, alignment.

## Step 3 — Write to Obsidian wiki

Create one markdown file at:
`/Users/jacob/Documents/The-Analyst/1 - Knowledge/99-Voice notes/<YYYY-MM-DD> - <slug>.md`

- **Date:** Use the audio file's mtime (when the recording happened), not today's date.
- **Slug:** 5–8 words derived from the BLUF. Plain ASCII, spaces between words, no punctuation. e.g. `Plan maintenance fire pilot Teeth`.
- **Collisions:** If the target filename exists, append ` (2)`, ` (3)`, etc.

**Frontmatter (YAML):**

```yaml
---
title: "<slug>"
type: voice-note
date: <YYYY-MM-DD>
source: "<original audio filename>"
area: <Telecommunications|D&SI|Transport|Infrastructure|PMO|Team|General>
people: [Name1, Name2]   # named participants — omit field entirely if none
tags: [voice-note, <2-4 topical tags in kebab-case>]
---
```

**Body:** Use the structured format matching the output mode (Summary or Detailed) — same section headings (`## Summary (BLUF)`, `## Actions`, `## Discussion & Notes`, `## Risks & Blockers`, `## Stakeholder Pulse`). Detailed mode just has fuller content in each section.

Do NOT include a top-level `# heading` in the body — the frontmatter `title` and filename carry the title; Obsidian renders the filename as the H1.

## Step 4 — Move processed file

After a successful wiki write, move the source audio to the `processed/` subfolder of the inbox:

```bash
mv "<source_path>" "/Users/<user>/Library/CloudStorage/GoogleDrive-<your-email>@gmail.com/My Drive/99 Voice memos/processed/"
```

**Only move on success.** If the wiki write failed, leave the file in the inbox so the next scan retries it. Tell the user which files succeeded and which failed.

For single-file mode where the source isn't in the Drive inbox (e.g. an ad-hoc path the user gave you), skip the move — just tell the user the path of the new wiki note.

## API Key

The script loads `OPENAI_API_KEY` from `.env` in this skill directory:
```
/Users/jacob/Documents/The-Analyst/.claude/skills/utility-transcribe/.env
```

If the key is missing, prompt: "Add your OpenAI API key to `.claude/skills/utility-transcribe/.env` — see `.env.example` for format."

## Supported formats
m4a, mp3, mp4, mpeg, mpga, m4a, wav, webm, ogg (OpenAI Whisper limits: 25MB per file)

## Large files (auto-handled)
The script handles oversize files automatically:
1. **>25 MB** → compress to 32 kbps mono AAC via `afconvert`
2. **Still >25 MB after compression** (calls >~1.5 hrs) → split into 60-min chunks via `ffmpeg`, transcribe each, concatenate with `\n\n` separators
No manual chunking required. Requires `ffmpeg` on PATH (installed via `brew install ffmpeg`).
