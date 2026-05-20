# Pattern Catalog — Writing Humanizer

This file is the single source of truth for all AI writing patterns. Loaded by SKILL.md on every humanizer pass.

When adding a new pattern: add the row here AND add a fixture in `tests/fixtures/[category].json`, then run `pytest tests/`.

---

## Category 1: Lexical — Word/Phrase Substitution or Deletion

| pattern_id | Trigger string | Action |
|---|---|---|
| lexical_worth_noting | "it's worth noting", "it should be noted", "it's important to note", "notably" (as sentence opener) | Delete the opener phrase, keep the claim that follows |
| lexical_end_of_day | "at the end of the day" | Delete the phrase entirely |
| lexical_moving_forward | "moving forward", "going forward" | Delete the phrase entirely |
| lexical_leverage | "leverage" used as a verb meaning "use" | Replace with "use" |
| lexical_utilize | "utilize", "utilise" | Replace with "use" |
| lexical_robust | "robust" in non-technical context (not describing a system/architecture) | Delete or replace with the specific quality being claimed |
| lexical_transformative | "transformative", "game-changing", "innovative", "groundbreaking" | Delete or replace with the specific outcome |
| lexical_delve | "delve into", "dive into", "unpack" | Replace with "examine", "analyse", or "review" as appropriate |
| lexical_in_order_to | "in order to" | Replace with "to" |
| lexical_at_this_point | "at this point in time" | Replace with "now" or delete |
| lexical_it_is_what | "it is what it is" | Delete entirely |
| lexical_synergies | "synergies" used without naming the specific benefit | Replace with the specific benefit or delete |
| lexical_could_potentially | "could potentially", "may potentially" | Replace with "could" or "may" |
| lexical_could_be_argued | "it could be argued that" | Delete opener, assert the claim directly |
| lexical_magnitude | "significant", "substantial", "considerable" used without a specific number | Replace with the actual figure, or delete and assert the claim directly |

---

## Category 2: Structural — Sentence/Paragraph Level

| pattern_id | Pattern | Detection heuristic | Action |
|---|---|---|---|
| structural_em_dash | Em dash used mid-sentence for dramatic pause, amplification, or as a separator | Em dash (—) anywhere in the sentence body | Replace with a plain hyphen (-). Delete if the clause adds nothing and removal keeps the sentence intact. Do not replace with a colon or split into two sentences. |
| structural_em_dash_heading | Em dash used in headings, titles, or labels as a separator | Em dash (—) between a label and its description (e.g. "Section 1 — Objective", "Figure 1 — Description") | Replace with a plain hyphen: "Section 1 - Objective". Em dashes in headings are an AI tell; plain hyphens are the Ventia convention |
| structural_rule_of_three | Rhetorical triad (rule of three) | Exactly three adjectives or noun phrases joined by "and" at the end of a clause, used for rhetorical effect rather than enumeration | Reduce to two items, or flatten to a direct statement |
| structural_preamble | Preamble before the main point | Sentence ≥15 words before the main verb/claim, where the preamble adds no information | Rewrite to lead with the claim |
| structural_tricolon | Parallel tricolon conclusion | Final sentence structured as "[abstract quality], [abstract quality], and [abstract quality]" | Flatten to a single direct claim |

---

## Category 3: Rhetorical — Performed Authenticity and AI-isms

| pattern_id | Trigger string | Action |
|---|---|---|
| rhetorical_i_want_clear | "I want to be clear", "let me be direct", "to be honest", "frankly" | Delete the opener — say the thing directly |
| rhetorical_ai_openers | Sentence-opening "Certainly", "Absolutely", "Of course", "Indeed" | Delete the opener word |
| rhetorical_inflection | "This is a critical moment", "we are at an inflection point", "watershed moment" | Replace with the specific fact that makes it critical |
| rhetorical_hedge_conclusion | "Overall, it appears that", "it seems that", "one could argue" | Strip the hedge, assert the conclusion directly |
| rhetorical_tricolon_quality | "This [noun] is [adj], [adj], and [adj]" where all three are abstract qualities | Flatten to one direct claim about the most important quality |
| rhetorical_landscape | "As we navigate", "in today's landscape", "in the current environment", "in the current climate" | Delete the framing clause, start with the substance |
| rhetorical_important_highlight | "It is important to highlight", "it bears mentioning", "it is worth highlighting" | Delete the opener, keep the claim |
| rhetorical_antithetical_pivot | "The fix is not to X - it is to Y", "This isn't about X - it's about Y", "The question is not whether X, but Y", "The goal isn't to X, it's to Y", "The answer is not X - it is Y" | Rewrite as a direct statement of what should be done, without the theatrical rejection of the alternative |
| rhetorical_declarative_reveal | "The fix is to...", "The answer is simple:", "The solution is clear:", "The path forward is to...", "The way forward is to..." | Delete the framing, state the recommendation directly |
