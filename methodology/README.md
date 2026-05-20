# Methodology

This is how transformation-os actually runs work. Three pages:

- [`pipeline.md`](pipeline.md) — the five-agent pipeline and the two human-approval gates
- [Skills index](../skills/) — the skill library, grouped by family
- The pipeline diagram lives in [`../docs/tile-01-pipeline.png`](../docs/tile-01-pipeline.png)

## The opinionated bits

1. **No analysis without a working construct.** Hypothesis-driven story skeleton sits between Agent 1 and Agent 2. If the working construct cannot be defended, no analysis runs.
2. **No deliverable without a partner review.** Pre-delivery critique by an agent simulating an MBB partner pass. Substance, structure, audience fit. Run before the deck is written, not after.
3. **Every quantitative claim has a source.** Evidence ledger reviewer agent traces every dollar figure, percentage, count, or named claim back to a source data file. Catches drift before it ships.
4. **Every artefact gets brand-audited.** Brand auditor scans for retired colours, wrong fonts, banned visuals, incorrect currency formatting. Read-only, never modifies. Reports.
5. **Every analysis writes back.** Wiki compile after every major deliverable. The wiki is queryable next session.
