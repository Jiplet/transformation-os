---
name: pm-problem-statement
description: Articulate a user problem using an empathy-driven framework before jumping to solutions. Use when the user asks to "frame a problem", "write a problem statement", "define the user problem", or needs to align stakeholders on a problem worth solving.
version: 1.0.0
---

## Purpose
Articulate a problem from the user's perspective using an empathy-driven framework that captures who they are, what they're trying to do, what's blocking them, why, and how it makes them feel. Use this to align stakeholders on the problem before jumping to solutions, and to frame product work around user outcomes rather than feature requests.

This is not a requirements doc — it's a human-centred problem narrative.

## Key Concepts

### The Problem Framing Framework

```
I am:           [Persona — 3-4 key characteristics]
Trying to:      [Desired outcomes]
But:            [Barriers preventing the outcomes]
Because:        [Root cause]
Which makes me feel: [Emotional impact]
```

Plus:
- **Context & Constraints:** Geographic, technological, time-based, demographic factors
- **Final Problem Statement:** One sentence that is measurable, empathetic, and shareable

### Why This Works
- Forces you to see the problem through the user's eyes
- "Trying to" emphasises desired results, not tasks
- "Because" pushes past symptoms to underlying issues
- "Makes me feel" humanises the problem and builds empathy

### Anti-Patterns
- **Solution smuggling:** "The problem is we lack AI analytics" → predetermined solution
- **Business problem:** "Our revenue is down" → symptom, not user problem
- **Feature request:** "Users need a dashboard" → what are they trying to do?
- **Generic:** "Users want better UX" → too vague to be actionable

### When to Use
- Kicking off discovery or problem validation
- Aligning stakeholders before solutioning
- When you have feature requests but unclear underlying problems

## Application

### Step 1: Gather User Context
- User interviews, direct quotes, observed behaviours
- Persona clarity (reference `pm-proto-persona`)
- Constraints data

**If missing context:** Interview users first. Don't fabricate problems.

### Step 2: Draft the Narrative

```markdown
## Problem Framing Narrative

**I am:** [Describe the key persona, 3-4 key characteristics]
- [Key characteristic 1]
- [Key characteristic 2]
- [Key characteristic 3]

**Trying to:**
- [Single sentence — desired outcomes the persona cares most about]

**But:**
- [Barrier 1 preventing outcomes]
- [Barrier 2]
- [Barrier 3]

**Because:**
- [Root cause — empathetically described]

**Which makes me feel:**
- [Emotions from the persona's perspective — use real user language]

## Context & Constraints
- [Geographic, tech, time, or demographic factors]

## Final Problem Statement
[Single, concise, empathetic summary sentence]
```

### Step 3: Quality Checks
- **"I am" specificity:** Can you picture this person? Not "busy professionals"
- **"Trying to" = outcome:** Measurable result, not a task
- **"But" = real barriers:** Not just inconveniences
- **"Because" = root cause:** Not a symptom
- **"Makes me feel" = authentic:** From research, not assumptions
- **Final statement:** One sentence, measurable, empathetic, shareable

**Formula:** `[Persona] needs a way to [desired outcome] because [root cause], which currently [emotional/practical impact].`

### Step 4: Validate
- Read to users who experience the problem — do they say "Yes, exactly!"?
- Share with stakeholders — does it align everyone?
- Iterate if anyone says "that's not the real problem"

## Example

```markdown
**I am:** A software developer on a distributed team
**Trying to:** Communicate in real-time with my team without losing context
**But:** Email is too slow and IM is ephemeral
**Because:** No tool combines real-time chat with searchable history
**Which makes me feel:** Frustrated and disconnected

**Final Problem Statement:**
Remote developers need a way to discuss and capture technical decisions in real-time because existing tools separate communication from documentation, causing context loss and repeated conversations.
```

## Common Pitfalls

- **Solution smuggling:** Reframe around desired outcome, not the feature
- **Business problem as user problem:** Dig into why users churn or what would make them stay
- **Generic personas:** "Busy professional" → "Sales rep managing 50+ leads manually in spreadsheets"
- **Symptom not root cause:** Ask "why" until you hit the underlying issue
- **Fabricated emotions:** Use real quotes; real emotions are "frustrated", "overwhelmed", "anxious"

## Related Skills
- `pm-proto-persona` — Defines the "I am" persona
- `pm-user-story` — Stories should address validated problems
- `pm-storyboard` — Problem statement frames Frames 2-3
