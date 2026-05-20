---
name: pm-proto-persona
description: Create an initial hypothesis-driven user persona from available research, market data, and stakeholder knowledge. Use when the user asks to "create a persona", "define our target user", "build a proto-persona", or needs to align a team on who they're building for before extensive research is complete.
version: 1.0.0
---

## Purpose
Create an initial, assumption-based persona profile that synthesises available user research, market data, and stakeholder knowledge into a working hypothesis about your target user. Use this to align teams early in product development, guide initial design decisions, and identify gaps in understanding that require validation through research.

This is not a validated persona — it's a "proto" (prototype) persona that evolves as you learn more.

## Key Concepts

### Proto vs. Validated Persona
| Proto-Persona | Validated Persona |
|---|---|
| Created in hours/days | Created over weeks/months |
| Based on assumptions + limited research | Based on extensive user research |
| Used to align teams early | Used to guide detailed design |
| Evolves rapidly | Stable over time |

### When to Use
- Early-stage product development (before extensive user research)
- Kicking off a new feature or pivot
- Aligning stakeholders on target users
- Identifying research gaps

### When NOT to Use
- After you've done extensive user research (create a validated persona instead)
- As a substitute for quantitative data

## Application

### Step 1: Gather Available Context
Collect before creating:
- User research: interview notes, survey results, support tickets
- Analytics: usage data, demographics, behavioural patterns
- Market data: industry reports, competitor user bases
- Stakeholder insights from sales/support/CS teams

**If missing context:** Note gaps — don't fabricate.

### Step 2: Build the Persona

```markdown
### Name
- [Alliterative, memorable name — e.g., "Manager Mike", "Startup Sarah"]

### Bio & Demographics
- [Age range]
- [Geographic location]
- [Social status]
- [Online presence]
- [Leisure activities]
- [Career status — job title, industry, seniority]

### Quotes
- "[Quote revealing how they think or speak]"
- "[Quote revealing frustrations or motivations]"
- "[Quote revealing attitudes or beliefs]"

### Pains
- [Pain point 1 — be specific, not vague]
- [Pain point 2]
- [Pain point 3]

### What is This Person Trying to Accomplish?
- [Observable behaviour or outcome 1]
- [Observable behaviour or outcome 2]
- [Observable behaviour or outcome 3]

### Goals
- [Short-term goal]
- [Long-term / aspirational goal]
- [Personal goal if relevant]

### Attitudes & Influences
- **Decision-Making Authority:** [Yes/No + context]
- **Decision Influencers:** [Who influences them — peers, analysts, managers]
- **Beliefs & Attitudes:** [Beliefs that impact adoption of your product]
```

### Step 3: Validate and Iterate
- Share with the team: does this persona resonate?
- Tag assumptions: add `[ASSUMPTION—VALIDATE]` where uncertain
- Plan research: use proto-persona to guide who to interview next
- Evolve as you learn; graduate to a validated persona when confidence is high

## Common Pitfalls

- **Demographics without behaviour:** "28, lives in NYC" → add behavioural context
- **Treating as fact:** tag assumptions explicitly
- **Creating 10 personas upfront:** start with 1-2
- **Fabricating quotes:** use real quotes or mark as `[PLACEHOLDER—NEEDS RESEARCH]`
- **Never validating:** plan research sprints to test key assumptions

## Related Skills
- `pm-problem-statement` — Persona informs the "I am" section
- `pm-user-story` — Stories use "As a [persona]"
- `pm-storyboard` — Persona is the main character
