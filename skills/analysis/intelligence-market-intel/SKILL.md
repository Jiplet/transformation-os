---
name: market-intel
description: Research and deliver structured intelligence on competitors, contracts, tenders, and market movements relevant to Ventia's infrastructure services business.
---

# Skill: Market Intelligence — Ventia

## When to Invoke
- "who won [contract/tender]", "what's [competitor] doing", "market intel on [topic]"
- "competitor analysis", "contract award", "tender intelligence", "work-winning"
- When Jacob names a competitor (Broadspectrum, Downer, Spotless, UGL, Programmed, Serco, Sodexo, Transdev, John Holland) or a specific contract/tender
- "what are we competing against", "market update", "pipeline intel"

---

## Step 1 — Classify the Request

Identify which mode applies before researching:

| Mode | Description |
|---|---|
| **Competitor profile** | Deep dive on a specific company |
| **Contract/tender intel** | Specific contract award or upcoming tender |
| **Market scan** | Broader sector or industry update |
| **Work-winning context** | Intelligence to support a bid or client conversation |

If the request spans more than one mode, note it and structure the output accordingly.

---

## Step 2 — Research

Always search the web. Cover these sources:

- **ASX announcements & investor docs** — for listed entities: VNT, DOW, CIMIC, Ferrovial, PERSOL Holdings
- **Tender portals** — AusTender (Commonwealth), Buy NSW, Tenders VIC, QTenders, SA Tenders, WA Buy, NZ GETS
- **Industry publications** — Infrastructure Magazine, Utility Magazine, Roads Australia, AMCA, Defence Connect, The Fifth Estate
- **News & press** — Company newsrooms, AFR, The Australian, Reuters, LinkedIn announcements
- **Government budgets and policy** — Infrastructure Australia pipeline, NDIS/defence budget statements, state infrastructure plans
- **Contract registers** — where agencies publish awarded contracts publicly

Search broadly first, then drill into specifics. Note the date of each source.

---

## Step 3 — Structure the Output

### Competitor Profile

| Section | Content |
|---|---|
| Company snapshot | Revenue, headcount, sectors, ownership structure (listed/private/subsidiary) |
| Recent wins | Contract awards in the last 12 months — values where disclosed |
| Recent losses | Contracts lost, not renewed, or retendered |
| Strategic moves | M&A activity, restructures, leadership changes, new market entries or exits |
| Relevance to Ventia | Where they compete head-to-head; where they don't |
| Strengths / Vulnerabilities | What they do well; where Ventia has a credible advantage |

### Contract / Tender Intel

| Section | Content |
|---|---|
| Contract details | Name, client, estimated value, duration, scope of services, location |
| Award details | Winner, award date, any public commentary from client or awardee |
| Known bidders | Entities known to have bid (from news, announcements, or market intelligence) |
| Scope analysis | Services in scope, sectors covered, geographic footprint |
| Ventia relevance | Whether Ventia bid, could have bid, or should track the renewal |
| Comparable contracts | Similar contracts Ventia holds or adjacent opportunities in the pipeline |

### Market Scan

| Section | Content |
|---|---|
| Key movements | Contract awards, M&A, leadership changes, regulatory changes in last 90 days |
| Pipeline | Known upcoming tenders, contract renewals, or government procurement events |
| Trends | Pricing direction, consolidation signals, technology adoption, policy changes |
| Ventia implications | What this means for positioning, strategy, or specific business units |

### Work-Winning Context

Lead with: what does the client care about, who else is likely bidding, and what is Ventia's differentiated position. End with a recommended angle or emphasis for the bid narrative.

---

## Step 4 — Deliver

### In-Conversation (default)
Present the full structured output in markdown. Always include:
- Source citations (URL or publication + date) for every material claim
- "As at [date]" flag on time-sensitive intelligence
- A **"So what"** closing paragraph — what Ventia should do with this information

### Document Output (if Jacob requests)
Generate a Word document using python-docx (NOT docx-js — it won't open in Word for Mac).

```
Save to: 4 - Projects/[topic-kebab]/[YYMMDD]_Market_Intel_[Subject].docx
```

Use the venv at `/Users/jacob/Documents/The-Analyst/.venv` and inline heredoc via Bash. Structure: cover page → executive summary → sections per the relevant output format above → sources appendix.

---

## Ventia Context (Reference)

| Field | Detail |
|---|---|
| Company | Ventia Infrastructure Services (ASX: VNT) |
| Revenue | ~$6B AUD |
| Sectors | Defence & Social Infrastructure, Telecommunications, Transport, Infrastructure Services |
| Key competitors | Broadspectrum (Ferrovial), Downer (DOW), Spotless (Downer sub), UGL (CIMIC), Programmed (PERSOL), Sodexo, Serco, Transdev, John Holland |
| Key clients | Department of Defence, NBN Co, Telstra, state transport agencies, water utilities |
| Geography | Australia and New Zealand |
| Currency | AUD |
| Brand | Navy `#0B3254`, Blue `#13B5EA` |

---

## Rules

- **Cite every claim.** URL, publication name, and date. No exceptions.
- **Never fabricate** contract values, award details, or bid outcomes. If not publicly available: "not disclosed" or "not confirmed."
- **Distinguish confirmed vs. speculated.** Label rumours or inferred intelligence explicitly.
- **Flag staleness.** If a source is older than 90 days, note it.
- **Be specific about action.** End every output with what Ventia should DO — not just what the market IS doing.
- **Tone:** Analyst-grade. Direct. No padding, no hedging unless uncertainty is genuine.
