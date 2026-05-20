---
name: route-task
description: Route an incoming Ventia task to the right thinker lens (CSO/CFO/CAO/CIO/CPO/etc.) and skill. Use at the start of any task that involves analysis, decision-making, exec output, or skill selection — especially when the task signal is ambiguous (cost lever, data question, contract, headcount, working capital, savings phasing, client approval, ops feasibility, risk, steerco, one-pager).
---

# Task Routing — Thinker Lenses + Output Skills

When Jacob provides a task, classify it and route to the right **thinker lens** + **skill**. Thinkers CHALLENGE and SHAPE — they don't produce outputs. Skills produce outputs.

| Signal | Load thinker(s) — Read the file | Route to skill |
|---|---|---|
| Initiative sizing, prioritisation, "should we do this" | `context/cso.md` | `program-tracker`, `scenario-model` |
| Data analysis, methodology, "is this right" | `context/cao.md` + `context/data-landscape.md` | `category-review`, `sql-review`, `data-request` |
| Systems feasibility, SAP ECC / S4HANA, Databricks, Novus, VMP, master data, integration, IT dependency, automation feasibility, reporting capability gap, "can we system-enforce this" | `context/cio.md` + `context/data-landscape.md` | `sql-review`, `data-request`, `scenario-model` |
| Cost modelling, pricing, inflation, market rates | `context/chief-economist.md` | `scenario-model`, `commercial-insight` |
| Category strategy, vendor, panel, consolidation | `context/cpo.md` + `context/coo.md` | `category-review`, `commercial-insight` |
| Headcount, leave, restructure, EA, labour cost | `context/chief-people-officer.md` + `context/general-counsel.md` | `leave-liability-telco`, `scenario-model` |
| Working capital, payment terms, DPO, DSO, cash flow | `context/cfo.md` | `scenario-model`, `commercial-insight` |
| Savings recognition, P&L vs balance sheet, phasing | `context/cfo.md` | `program-tracker`, `exec-summary` |
| Contract terms, EA clauses, procurement policy, legal feasibility | `context/general-counsel.md` + `context/cro.md` | `commercial-insight` |
| Client approval / notification, head contract, SLA/KPI impact, contract reopen, price review, account team, named client (Telstra, AGFMA, Defence, NBN, state transport), IGET / indigenous / local content, client-specified vendor | `context/chief-client-officer.md` + `context/general-counsel.md` | `commercial-insight`, `category-review` |
| Operational feasibility, site adoption, change management, mobilisation | `context/coo.md` + `context/ventia-delivery-difficulties.md` | `epic-builder`, `scenario-model` |
| Risk, insurance, WHS, vendor lock-in, regulatory | `context/cro.md` + `context/general-counsel.md` | `scenario-model`, `commercial-insight` |
| Competitor, tender, contract award, market news | — | `market-intel` |
| Steerco, ExCo update, program status | `context/cso.md` + `context/cfo.md` | `steerco-pack`, `program-tracker` |
| One-pager, CFO summary, exec brief | `context/cfo.md` | `exec-summary` |
| Smartsheet data, team plan, task tracking | — | `smartsheet` |
| Web page, frontend, UI design, HTML artifact | `context/cdo.md` | `web-frontend-design`, `impeccable/*`, `taste-skill/*`, `huashu-design`, `emil-design-eng` (precedence rules in `frontend-precedence` skill) |
| Slide deck, presentation pipeline | — | See `context/pipeline.md` |
| New project setup / group spend analysis | — | See `context/triggers.md` |

**Rule:** When a thinker column is specified, **Read the file** before responding. Don't rely on memory of its content. Multi-signal tasks load multiple thinkers — don't pick just one. When in doubt between CIO and CAO: CAO challenges "is this analysis right"; CIO challenges "can the system / data actually deliver this." When in doubt between Chief Client and CRO/GC: CRO/GC cover legal enforceability; Chief Client covers relationship reaction and client-side approval path.
