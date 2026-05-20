---
description: Build a persistent DuckDB database from a source file (xlsx, csv, parquet, sqlite). Indexes obvious filter columns, runs a sanity query, writes a memory entry. Default location is The-Analyst/1 - Reference/.
argument-hint: <source-path> [target-name] [--temp]
allowed-tools: Read, Glob, Bash, Write, Edit
---

You are building a **persistent DuckDB database** from a local source file. Persistence is the default — Jacob has explicitly stated he rarely needs temp/in-memory.

## Inputs

- `$1` (required): source file path. Supported types: `.xlsx`, `.xls`, `.csv`, `.tsv`, `.parquet`, `.db` (SQLite), `.sqlite`, `.duckdb`
- `$2` (optional): target name (without extension). If omitted, derive from source filename — snake_case, no version suffix.
- `--temp` flag: if present, use `:memory:` instead of a file. Otherwise build persistent.

If `$1` is missing, ask: *"Which file? Give me an absolute path."* Don't proceed without it.

## Default location

Persistent files go to:

```
/Users/jacob/Documents/The-Analyst/1 - Reference/[name].duckdb
```

If a file already exists at the target path, ask before overwriting unless the user passed `--force` or said "rebuild".

## Build steps

Run as a single `duckdb` CLI invocation via Bash (faster than MCP for builds).

### 1. Detect source type and load the right extension

| Extension | Read function | Extension to LOAD |
|---|---|---|
| `.xlsx`, `.xls` | `read_xlsx('$1', sheet='...')` | `excel` |
| `.csv` | `read_csv('$1', AUTO_DETECT=TRUE)` | none |
| `.tsv` | `read_csv('$1', delim='\t')` | none |
| `.parquet` | `read_parquet('$1')` | none |
| `.db`, `.sqlite` | `ATTACH '$1' AS src (TYPE SQLITE); SELECT * FROM src.[table]` | `sqlite` |
| `.duckdb` | `ATTACH '$1' AS src; SELECT * FROM src.[table]` | none |

For Excel sources, if there are multiple sheets and the user hasn't specified one, list them first (`SELECT * FROM read_xlsx_metadata('$1')`) and confirm which to load. Default to a sheet named like `"Raw - *"` or the first sheet if there's only one.

For SQLite/DuckDB sources, copy **all** tables across (use `SHOW TABLES` to enumerate), not just one.

### 2. Build the file

```bash
duckdb "/Users/jacob/Documents/The-Analyst/1 - Reference/[name].duckdb" -c "
  -- LOAD extension if needed
  -- ATTACH source if needed
  CREATE OR REPLACE TABLE [tablename] AS SELECT * FROM [source];
  -- repeat per table for multi-table sources
  -- DETACH source if attached
  -- CREATE INDEX statements (see step 3)
"
```

### 3. Index obvious filter columns

After build, run `DESCRIBE [tablename]` and create indexes for any column whose name (case-insensitive) matches:

| Pattern | Why |
|---|---|
| `sector*`, `*sector*` | Always filtered |
| `fy`, `fiscal*`, `year` | Always filtered |
| `vendor*`, `supplier*` | Always grouped/filtered |
| `l1`, `l2`, `l3`, `category*`, `subcategory*` | Category cuts |
| `project*`, `pc_*`, `profit_centre*`, `cost_centre*` | Project cuts |
| `panel*`, `status` | Frequently filtered |
| `state*`, `region*`, `country*` | Geo cuts |

Index naming: `idx_[lowercase_column]`. Skip columns that are obviously high-cardinality identifiers like document numbers unless the user requests it.

### 4. Sanity query

Run a representative aggregation. For spend-shaped data: `SUM(*amount*) / 1e6 AS m_aud`. For other data: a `COUNT(*)` and a `GROUP BY` on the most likely sector/category column. Report row count and a top-N if it makes sense.

### 5. Schema gotcha scan

Look for things that will trip up future queries and call them out:

- `FY` column stored as integer vs string (e.g. `2025` not `'FY2025'`)
- Mixed case in filter values (`'TELECOMMUNICATIONS'` vs `'Telecommunications'`)
- Date columns stored as strings (`VARCHAR` instead of `DATE`)
- Currency columns where AUD is mixed with other currencies
- Columns with leading/trailing whitespace
- Columns whose names need quoting (spaces, parens)

### 6. Write memory entry

Create `/Users/jacob/.claude/projects/-Users-jacob-Documents/memory/ref-[name]-duckdb.md` with:

```markdown
---
name: [Name] — persistent DuckDB
description: [One-line: what's in it and when to use it]
type: reference
---

**File:** `/Users/jacob/Documents/The-Analyst/1 - Reference/[name].duckdb` (DuckDB, [size], persistent)

**Source:** [original source file]
**Built:** [date]

**Tables:**
- `[table]` — [N] rows, [key columns]

**Indexed on:** [list]

**How to query:**
\`\`\`sql
ATTACH '/Users/jacob/Documents/The-Analyst/1 - Reference/[name].duckdb' AS x;
SELECT ... FROM x.[table] WHERE ...;
\`\`\`

**Schema gotchas:**
- [each one found in step 5]

**Sanity figures (verify if stale):**
- [from step 4]

**When to use:** [trigger description]
```

Then update `/Users/jacob/.claude/projects/-Users-jacob-Documents/memory/MEMORY.md` — add a single line under `## Reference`:

```
- [[Name] — DuckDB](ref-[name]-duckdb.md) — [one-line hook]
```

### 7. Rebuild handling

If the target file already exists and the user says "rebuild" or passes `--force`, overwrite without asking. Otherwise ask first.

## Output format

After build, report:

```
✅ Built [name].duckdb at [path] ([size])

Tables:
| Table | Rows | Indexed |
|---|---|---|
| [t] | [n] | [cols] |

Sanity check:
[the aggregation result]

Schema gotchas:
- [list]

Memory: ref-[name]-duckdb.md created, MEMORY.md updated.
```

## Rules

- **Persistent by default.** Only use `:memory:` if `--temp` is passed or the user explicitly says "temp", "throwaway", "in-memory", "just for this query".
- **Don't ask before indexing** — pattern-match the column names and just do it. Indexes on non-existent columns will error harmlessly; the build still succeeds.
- **Don't write a migration script or a Python loader.** The duckdb CLI handles every supported source type natively.
- **One file = one purpose.** Don't merge unrelated datasets into one `.duckdb` file unless asked. Build separate files.
- **Verify before declaring done.** Always run the sanity query and read the result before reporting back.
- **Flag stale figures in memory.** If you're rebuilding an existing file, the sanity figures in the previous memory entry are now stale — overwrite them.
