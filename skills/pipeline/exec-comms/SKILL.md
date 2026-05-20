---
description: Visual + structural format discipline for any exec-bound markdown deliverable. Auto-fire on any draft bound for a named GM, CFO, Sector Exec, ExCo, Board, or external senior audience. Also auto-chain after /clevel-review Phase 3. Takes a draft, applies strict format rules (callouts, parallel tables, bold-the-punchline, banned-word scan, length caps, scanner test). Does NOT change meaning, only form. SKIP for routine wiki edits, internal team docs, status updates.
allowed-tools: Read, Write, Edit, Bash, AskUserQuestion
---

# /exec-comms

Format discipline. Takes a content-correct draft, restructures it for exec readability. Does **not** rewrite content — that's `/clevel-review`'s job upstream.

Canonical spec: `/Users/jacob/Documents/The-Analyst/6 - slash commands/exec-comms.md`

## When to invoke

- After `/clevel-review` Phase 3 (auto-chain)
- Standalone: `/exec-comms <file path>` against any markdown bound for a senior audience
- Auto-fire when audience is named in frontmatter or visible in draft (GM, CFO, Sector Exec, ExCo, Board, external client exec)
- Skip: internal wiki edits, status updates, team docs without a named senior audience

## Inputs (ask via AskUserQuestion if not provided)

- **File path** of the draft (or paste the draft inline)
- **Audience tier** — GM / CFO / ExCo / Board / External (drives length cap and template)
- **Read time target** if different from audience default

## Format rules (enforce, do not negotiate)

### Visual structure

Every page opens with a single callout block:
```
> **Audience:** [named person + role] | **Read time:** [N] min | **Core message:** [one sentence]
```

Every major section follows **Lead → Evidence → Implication**:
- **Lead:** 1-2 sentences with the punchline in **bold**
- **Evidence:** table or tight bullets (≤3 sentences each)
- **Implication:** one **bold** sentence stating "so what"

Asks / recommendations / risks **always** in a parallel table with consistent columns.

### Visual rules

- ≤3 sentences per paragraph
- ≤2 levels of bullet nesting
- **Bold** the punchline of every paragraph (scanner test: reading only the bolds tells the story)
- Section headings sentence-case, parallel structure (all noun-phrase OR all imperative, not mixed)
- Tables for any comparison of 3+ items (no prose lists)
- Use `>` blockquote for the so-what callout, never decorative

### Banned words (scan + replace)

| Banned | Replace with |
|---|---|
| leverage (verb) | use |
| going forward / moving forward | cut, or use specific date |
| in order to | to |
| we believe | cut (state directly) |
| it should be noted | cut |
| robust | tested / specific |
| synergies | specific outcome |
| at this time | cut |
| deep dive | review |
| circle back | follow up [date] |
| touch base | meet [date] |
| best practice | named practice / standard |

### Banned AI tics (cut on sight)

- em-dashes (`—`)
- "It's worth noting"
- "Importantly,"
- "Furthermore,"
- "In summary,"
- "Ultimately,"
- "That said,"
- "Notably,"
- "Indeed,"

### Banned structural patterns (refuse to ship)

- "What this is NOT" sections (defensive)
- "Pre-empted Questions" / "FAQs" sections (if asked, answer; don't pre-litigate)
- Asks of different shapes in same list (parallel structure mandatory)
- Value tables before the ask (lead with the answer, not the proof)
- Headlines without urgency markers (anchor every ask to a date)

### Length caps (hard)

| Audience | Word count cap | Read time |
|---|---|---|
| GM | 500 | 2-3 min |
| CFO | 350 | 1.5 min |
| ExCo (1-page) | 700 | 3 min — *v1.1, calls program-steerco-pack for deck format* |
| Board memo | 400 | 2 min — *v1.1* |

If draft exceeds cap, the skill must cut, not warn.

## Process

1. **Read** the input draft (file or paste)
2. **Classify** audience tier (from frontmatter, draft header, or AskUserQuestion)
3. **Scan** for violations:
   - Banned words / AI tics (regex)
   - Em-dashes (regex `—`)
   - Paragraph length >3 sentences
   - Bullet nesting >2 levels
   - Section structure (does each section have Lead → Evidence → Implication?)
   - Defensive sections present
   - Parallel structure in lists
   - Word count vs audience cap
   - Bold-punchline coverage (every paragraph has a bold span)
4. **Apply changes** in this order:
   1. Strip banned words / AI tics / em-dashes
   2. Cut defensive sections entirely
   3. Restructure each section to Lead → Evidence → Implication
   4. Convert prose lists to tables where ≥3 items
   5. Add bold to each paragraph's punchline
   6. Cut to length cap (drop weakest content first, then compress)
   7. Replace the page header with the standard callout block
5. **Run scanner test:** extract every bold span, concatenate, read. If the bolds-only version doesn't tell the story, return to step 4 and rebold.
6. **Verification report**: word count before/after, violations fixed, scanner test PASS / FAIL.

## Output

The skill writes the reformatted markdown back to the same file path (or to a `.formatted.md` sidecar if `--preserve` flag set).

Then prints:
```
## /exec-comms verification
- Audience tier: [tier]
- Word count: [before] → [after] (cap: [cap])
- Read time: [N] min (target: [target])
- Banned words removed: [N]
- Em-dashes removed: [N]
- AI tics removed: [N]
- Defensive sections cut: [list]
- Tables created from prose lists: [N]
- Bold punchlines added: [N]
- Scanner test (bolds-only story coherent): PASS / FAIL
- Sections restructured to Lead-Evidence-Implication: [N]
```

## Failure modes

- **Audience unknown**: ASK via AskUserQuestion. Don't guess.
- **Draft is too short for cap (e.g. 100 words for GM)**: warn, do not pad. Format-only means no content adds.
- **Scanner test fails after 2 reformat passes**: surface to user with the bolds-only string and ask which paragraphs need rebold judgment.
- **Banned word is a quoted source (e.g. "Auditor-General said robust")**: preserve quoted material verbatim. Only replace banned words in original prose.
- **Length cap conflicts with content the user wants kept**: surface as decision point, do not auto-cut without confirmation.

## Reference

- Spec: `/Users/jacob/Documents/The-Analyst/6 - slash commands/exec-comms.md`
- Upstream: `/clevel-review` (auto-chains to this skill at Phase 3)
- Related: `program-exec-summary` (Word output), `utility-anthropics-brand-voice` (brand-level voice rules)
