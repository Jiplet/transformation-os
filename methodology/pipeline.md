# The Five-Agent Pipeline

| Stage | What it does | Who signs off |
|---|---|---|
| Agent 1: Clean | Ingest raw data (xlsx/csv/parquet/pdf), normalise schemas, classify vendors/categories | (machine) |
| **Gate: Working Construct** | Hypothesis-driven story skeleton. MBB practice. Pyramid principle, MECE, "so what." | **Jacob** |
| Agent 2: Analysis | DuckDB / spend cube cuts. Pivot, filter, join, group-by. Structured outputs only. | (machine) |
| Agent 3: Synthesis | Findings to implications. Pattern recognition across cuts. Stress-test against constraints. | (machine) |
| Agent 4: Blueprint | Deck architecture, key messages per slide, exhibit list. Word/PPT skeleton with placeholders. | (machine) |
| **Gate: Partner Review** | Pre-delivery critique. Simulates an MBB partner pass. Substance / structure / audience fit. | **Jacob** |
| Agent 5: Final Deck | PPTX / Word / HTML produced via output skills. Brand-audited. Evidence-ledger-reviewed. | (machine) |

The two gates are non-negotiable. They exist because exec deliverables die at the partner review, not at the analysis. Catching it at Gate 2 saves a week.
