---
name: pm-customer-journey
description: Facilitate creation of a customer journey map by guiding through actor, scenario, journey phases, actions/emotions, and opportunities. Use when the user asks to "map the customer journey", "create a journey map", "visualise the customer experience", or needs to identify pain points and improvement opportunities across an end-to-end experience.
version: 1.0.0
---

## Purpose
Guide product managers through creating a customer journey map by asking adaptive questions about the actor (persona), scenario/goal, journey phases, actions/emotions, and opportunities for improvement. Use this to visualise the end-to-end customer experience, identify pain points, and create a shared mental model across teams.

This is not a feature roadmap — it's a discovery and alignment tool.

## Key Concepts

### Five Key Components (NNGroup Framework)
1. **Actor** — Specific persona whose perspective anchors the map
2. **Scenario + Expectations** — Situational context and associated goals
3. **Journey Phases** — High-level stages (e.g., Discover → Try → Buy → Use → Support)
4. **Actions, Mindsets, and Emotions** — Behaviours, thoughts, emotional responses per phase
5. **Opportunities** — Insights identifying where experience can improve

### Journey Map Structure
```
Actor: [Persona]   Scenario: [Goal/Context]

Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
Actions:  Actions:  Actions:  Actions:  Actions:
Thoughts: Thoughts: Thoughts: Thoughts: Thoughts:
Emotions: Emotions: Emotions: Emotions: Emotions:
Opps:     Opps:     Opps:     Opps:     Opps:
```

### When to Use
- Starting customer discovery
- Identifying pain points for retention/engagement initiatives
- Aligning cross-functional teams on customer perspective
- Prioritising which problems to solve first

### When NOT to Use
- When you already understand the journey deeply
- As a substitute for user research (maps require research input)

## Application

This skill is interactive — ask one question at a time.

### Step 0: Gather Context First
Ask the user to share any available:
- User interviews, discovery notes, support tickets
- Churn reasons, NPS feedback, analytics
- Personas or proto-personas
- Existing journey documentation

---

### Question 1: Identify the Actor
"Who is the actor for this journey map?"

Offer options:
1. **Primary persona** — main target customer
2. **Secondary persona** — different user segment
3. **High-churn persona** — segment with highest churn
4. **Newly discovered persona** — emerging segment from recent research

---

### Question 2: Define Scenario + Goal
"What's the scenario and goal — what is the actor trying to accomplish?"

Common scenarios:
1. **First-time use** — new user onboarding, discovery to activation
2. **Core workflow** — recurring task done regularly
3. **Problem resolution** — user encounters issue, seeks help
4. **Upgrade/expansion** — free user considering paid, or expanding usage

---

### Question 3: Identify Journey Phases
Generate 4-6 journey phases based on the scenario. Present to user and ask:
"Do these phases capture the full journey? Add, remove, or rename?"

Example (First-time use):
```
1. Discover → 2. Evaluate → 3. Try → 4. Activate → 5. Use → 6. Expand
```

---

### Question 4: Map Actions, Thoughts, Emotions
For each phase, generate 3-5 actions, thoughts, and emotions. Show full map, then ask:
"Does this capture the customer experience accurately?"

Format per phase:
```
Phase [N]: [Name]

Actions:
- [Action 1]
- [Action 2]

Thoughts:
- "[Quote 1]"
- "[Quote 2]"

Emotions:
- [Emotion 1] 😊/😐/😞
- [Emotion 2]

Pain Points:
- [Pain point 1]
```

---

### Question 5: Identify Opportunities
Generate 5-7 opportunities ranked by impact (HIGH/MEDIUM/LOW). Ask:
"Do these align with your priorities? Which should we focus on first?"

Format per opportunity:
```
## [N]. [Opportunity Name] (Phase: [X])
**Pain Point:** [Description]
**Evidence:** [Data/research]
**Opportunity:** [Proposed improvement]
**Impact:** HIGH/MEDIUM/LOW — [Rationale]
```

---

### Output: Full Journey Map

```markdown
# Customer Journey Map: [Scenario]

**Actor:** [Persona]
**Scenario:** [Context]
**Goal:** [What actor is trying to accomplish]

## Journey Phases
[Phase 1] → [Phase 2] → [Phase 3] → [Phase 4] → [Phase 5]

## Full Journey Map
### Phase 1: [Name]
**Actions:** ...
**Thoughts:** ...
**Emotions:** ...
**Pain Points:** ...

[repeat for all phases]

## Opportunities (Prioritised)
[ranked list]

## Next Steps
1. Validate opportunities with customer interviews
2. Prioritise using impact/effort assessment
3. Frame top opportunities as problem statements (use `pm-problem-statement`)
```

## Common Pitfalls

- **Mapping internal process:** Journey phases should reflect customer POV, not sales stages
- **No emotions or pain points:** Missing the point — emotions show where experience breaks
- **Too many personas in one map:** One map per persona
- **Opportunities not prioritised:** Rank by impact so team knows where to start
- **Map created in isolation:** Facilitate with cross-functional team (PM, design, engineering, support)

## Related Skills
- `pm-proto-persona` — Defines the actor
- `pm-problem-statement` — Converts opportunities into problem statements
