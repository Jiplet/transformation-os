# Engineering Standards: Distilled Gotchas

This is the catalogue my system reads before it writes code. Twenty rules today across seven domains, each one earned: every entry exists because a build got it wrong once. A silent SQL trap that returned plausible-looking wrong numbers. A library that produced files that would not open on the reader's machine. A field that lied about its contents.

When a new failure mode surfaces it becomes a rule here, and the next build avoids it. The list only grows, and each entry makes every future build cheaper. Not a style guide: a compounding asset. The rules are deliberately tool-agnostic and portable.

---

## 1. ERP / source-system data

**ERP master-data keys are frequently zero-padded. Never hardcode an ID lifted from a CSV or export.**
Trap: The source system stores keys as zero-padded fixed-width strings. Export tools strip leading zeros for readability. A query using the stripped value joins or filters against zero rows, silently.
Do: Derive the key by joining through a name or description field, or carry it natively through the same table chain.
Why: The result looks valid and returns no error. The failure is invisible.

**Source systems routinely repurpose standard fields for local data. Verify where a value actually lives before writing the query.**
Trap: A field whose name implies it holds a specific value (e.g. a tax ID field, a terms field) may be empty in a given implementation, with the real data stored in a field whose name implies something else entirely.
Do: Run a population count across candidate fields before assuming the field whose name matches your intent is the one that is populated.
Why: Querying the "expected" field returns nulls with no error message. The bug only surfaces when results reach someone who knows what the number should be.

**Warehouse monetary amounts can settle in arrears. Cut the current period to the last fully-settled month, not today.**
Trap: A group-currency or FX-converted amount field may be NULL for recent months because the rate conversion runs on a period-close schedule. The underlying transaction amounts are complete at posting. Using the lagging field for current-period analysis shows artificially low spend that bears no resemblance to actual run-rate.
Do: Use the local-currency amount (complete at posting) and convert to a reporting currency yourself using a published average rate. Apply the same rate set to both comparison periods for a constant-currency view.
Why: A YoY comparison mixing a complete prior period against an incomplete current period will show a false step-change. It will be challenged immediately by anyone who knows the actual numbers.

**Never infer a business cause from an account, GL code, project, or vendor name.**
Trap: Naming is not evidence of cause. A cost movement assigned to a project or account with a suggestive name does not confirm that the movement relates to whatever that name implies.
Do: State the movement: "Account X moved from Y to Z." Flag it for investigation. Never add a causal explanation unless it is sourced from data, not the label.
Why: Naming conventions in mature ERP systems are frequently legacy, inconsistent, and miscategorised. Name-based causal claims are fabricated attribution. They fail the "how do you know?" test immediately.

---

## 2. SQL / query layer

**Multi-version data stores can silently triple or double every figure. Always filter to a single version.**
Trap: A fact table holding multiple forecast or data versions returns all of them when queried without a version filter. The aggregate looks plausible but is a multiple of the correct figure.
Do: Always include a version filter as the first WHERE predicate. Parameterise it, never leave it implicit.
Why: There is no error. The result is a round number that passes a casual reasonableness check.

**Fan-out aggregation traps: the same base figure may be stored at multiple incompatible grains. Summing across all of them produces a meaningless total.**
Trap: A fact table may store the same underlying spend or cost at two independent slices (e.g. a vendor-classified rollup and a GL-leaf view). Both slices reconcile internally to the same total; summing both slices produces approximately double.
Do: Pick one grain per analysis and filter explicitly. Document which grain was used and why.
Why: The double-count is invisible unless you know the table design. The output passes a top-line check but is wrong.

**All queries must be self-documenting: plain-English header inside the code, plain-English comment on every output column.**
Trap: A query without a header block is unusable when resumed weeks later. A header that lives only in a surrounding document does not travel when the code is copy-pasted into another tool.
Do: Every SQL or script must include: (1) a plain-English "READ ME FIRST" block at the top of the code itself, explaining what it does and why, (2) a plain-English comment on every output column, and (3) a plain-word translation of any system-specific field name used.
Why: Work is resumed cold. Dense uncommented code is a dead end regardless of correctness.

**Before writing unfamiliar syntax, look up the current docs. Do not guess.**
Trap: Hallucinated function signatures fail at runtime or, worse, return silently wrong results.
Do: Fetch the current official documentation before writing window functions, pivot operations, join types, or any syntax you have not used recently.
Why: Training data does not track library patch releases. A subtly wrong function returns wrong output without an error.

---

## 3. Spreadsheet output

**Never use a generation library's default palette or theme. Run an objective brand audit before calling an artefact done.**
Trap: Code-generation libraries ship with their own default colour palettes and font choices baked into example code. Subagents following that example code propagate the library's defaults into the output, not the organisation's current standards. Self-certification ("brand intact") from a subagent is not sufficient evidence.
Do: After every spreadsheet build or in-place edit, run an objective colour scan checking for any retired or non-standard hex values, and audit the font family. Do not accept a subagent's self-report.
Why: On three consecutive builds on a senior finance workbook, the subagent self-certified brand compliance. All three contained a retired colour that only surfaced when reviewed by a human.

**Use formulas, not hardcoded computed values. Recalculate before delivery.**
Trap: Hardcoded values make the workbook non-updateable and break the audit trail. Some spreadsheet applications do not auto-recalculate all cells on open.
Do: Use cell references and formula chains throughout (lookup functions, conditional sums, arithmetic references). Force recalculation before saving the final file.
Why: A workbook with hardcoded values cannot be updated when an input changes. A workbook that has not been recalculated may display stale values as the headline figure.

**Pivot tables and native table objects require a different tool than the one that builds the workbook structure.**
Trap: Some spreadsheet generation libraries cannot author pivot tables or native table objects. Attempting to do so produces a workbook that looks correct in the script but is empty or corrupt in the application.
Do: Identify up front whether the deliverable requires pivots or native tables, and route to a tool that supports them rather than patching around a library limitation.
Why: The failure is not caught until the file is opened. At that point the build has already been reported as done.

---

## 4. Document generation

**Verify that the library you use to generate documents actually produces files that open in the target application.**
Trap: Some document-generation libraries produce structurally valid output that fails to open in the application your reader uses. The build succeeds; the file fails on the reader's machine.
Do: Standardise on a library verified to open in the specific application and operating system your readers use. For Word documents opened on macOS, prefer Python-based generation over Node.js-based generation.
Why: A document that will not open is a zero-quality deliverable regardless of how well the content was written. The failure is invisible until the reader tries to open it.

---

## 5. File and environment handling

**Cloud-synced files may not materialise on disk until an application opens them. Do not use shell file-inspection utilities on these paths.**
Trap: A file in a cloud-sync folder (Drive, iCloud, etc.) that has just synchronised may show a size in a directory listing but return "no such file or directory" when read by `file(1)`, `stat`, or `cat`. Shell utilities read filesystem metadata; the file content has not yet been fetched from the cloud.
Do: Use a language-level open call (e.g. Python `open()`) rather than shelling out to file-inspection utilities. The language-level open triggers the on-demand cloud fetch and returns real bytes.
Why: The gotcha caused a pipeline's container-detection step to receive empty output, silently fall through a try/except, and send the wrong file format to a downstream API. The 400 error appeared far from the real failure.

**File extensions lie. A file with a recognised extension may use a different container format. Check the actual container before processing.**
Trap: Some recording devices write a container format that differs from the file extension (e.g. a 3GPP container with an `.m4a` extension). APIs that support the extension may reject the actual container. The error message references the extension (which is "supported") rather than the container (which is not), making the cause non-obvious.
Do: Read the first bytes of the file to check the container magic bytes or brand identifier, not the extension. Re-encode to a verified-compatible format before sending to an API.
Why: An API 400 "invalid file format" on a file with a recognised extension is almost always a container/extension mismatch. Checking the extension is not sufficient.

**Pin the Python environment. Use the project venv for workbook and document generation; use isolated tooling for packages requiring a different runtime version.**
Trap: Running a script outside the project venv may silently use a different Python version or missing packages, producing import errors or version conflicts that look like code bugs.
Do: Explicitly activate the project venv before running any generation script. For packages requiring a runtime version incompatible with the project venv, use isolated tool installation (e.g. `uv tool install`) rather than upgrading the shared venv.
Why: Environment mismatches are a common source of "it works on my machine" failures. Explicit activation removes the ambiguity.

---

## 6. Code quality and provenance

**Every code artefact must include a plain-English header inside the code itself, not only in the surrounding document.**
Trap: A header comment that lives only in the surrounding wiki note or README does not travel when the code is copy-pasted into a query editor, notebook, or another tool.
Do: The plain-English "READ ME FIRST" block goes at the top of the code file or code fence, inside the code. It explains: what this does, why, and what the output columns mean.
Why: Code is resumed cold. The document context it was written in is not available in the tool where it runs.

**State the file path every time you share or discuss a code snippet.**
Trap: Multi-file projects accumulate versions. Discussing a change without naming the file leaves the reader uncertain about which version or location the change applies to.
Do: Lead every code discussion with an explicit file path. Do this proactively, not only when asked.
Why: Ambiguity about file location has caused the wrong version of a query to be modified.

**Initiative-specific code routes to the knowledge base, not the project working folder.**
Trap: Code dropped in a project folder is invisible to the organisation's knowledge graph and creates a second source of truth that diverges from the canonical store.
Do: Any SQL or script tied to an initiative becomes a versioned note in the knowledge base (wiki), in a fenced code block, under the relevant initiative folder. Project folders hold documentation and logs, not code.
Why: Code outside the knowledge base is unreachable from the graph and breaks the single-source-of-truth design.

---

## 7. Integrations

**Cross-sheet conditional matches in spreadsheet platforms can silently return zero when key columns mix numeric and text types.**
Trap: A cross-sheet COUNTIF or equivalent conditional function returns 0 for every criterion when the source column stores some cells as numbers and others as text (a mixed-type column). The column resolves correctly for non-conditional functions (e.g. a count of all cells), so the reference itself appears healthy. The failure is in the type coercion during criterion matching.
Do: Key all cross-sheet matching on a column that is consistently typed: a text, picklist, or controlled-vocabulary column. Diagnose a suspected mixed-type column by running a numeric-value count vs a total count and comparing them.
Why: Mixed-type key columns are common when IDs are imported from systems that produce them as numbers in some rows and strings in others. The silent zero return is indistinguishable from a correct "not found" result.

**Some platform features cannot be created via API. Verify the API surface before designing a workflow that depends on programmatic creation.**
Trap: Features such as reports, dashboards, row hierarchy, and certain formula types may be read-only or creation-only via UI in the platform's API. Attempting to create them programmatically either returns an error (best case) or silently does nothing (worst case).
Do: Check the API documentation for create-endpoint coverage before designing any workflow that programmatically creates platform artefacts. For features with no create API: build them once in the UI, then use the API only for read and update operations.
Why: A workflow designed around programmatic report creation that hits an API gap must be redesigned after the build is already in progress, which is expensive.
