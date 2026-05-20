---
name: pm-user-story
description: Write clear user stories combining Mike Cohn format with Gherkin acceptance criteria. Use when the user asks to "write a user story", "create acceptance criteria", "format a requirement as a story", or needs to translate user needs into development-ready work.
version: 1.0.0
---

## Purpose
Create clear, concise user stories that combine Mike Cohn's user story format with Gherkin-style acceptance criteria. Use this to translate user needs into actionable development work that focuses on outcomes, ensures shared understanding between product and engineering, and provides testable success criteria.

This is not a feature spec — it's a conversation starter.

## Key Concepts

### The Format

**Use Case (Mike Cohn):**
- **As a** [specific persona/role]
- **I want to** [action to achieve outcome]
- **so that** [desired outcome / motivation]

**Acceptance Criteria (Gherkin):**
- **Scenario:** [Brief description]
- **Given:** [Precondition]
- **and Given:** [Additional preconditions as needed]
- **When:** [Triggering event — one only]
- **Then:** [Expected outcome — one only]

### Key Rules
- One **When** per story. Multiple Whens = split the story.
- One **Then** per story. Multiple Thens = split the story.
- "As a user" is too generic — always use a specific persona.
- "So that" must reveal the *why*, not restate the action.

### When to Use
- Translating user needs into development work
- Backlog grooming and sprint planning
- Ensuring testable acceptance criteria exist before development

### When NOT to Use
- For pure technical debt or refactoring (use engineering tasks)
- Before understanding the user problem (write a problem statement first)

## Application

### Step 1: Gather Context
- **User persona:** Who is this for?
- **Problem understanding:** What need does this address?
- **Desired outcome:** What does success look like?

### Step 2: Write the Story

```markdown
### User Story [ID]:

- **Summary:** [Brief, value-focused title]

#### Use Case:
- **As a** [specific persona, not "user"]
- **I want to** [action the user takes]
- **so that** [desired outcome — the WHY]

#### Acceptance Criteria:
- **Scenario:** [Human-readable description of the scenario]
- **Given:** [Initial context / precondition]
- **and Given:** [Additional preconditions]
- **When:** [Single triggering event]
- **Then:** [Single measurable expected outcome]
```

### Step 3: Quality Checks
- **"As a" specificity:** Specific persona, not "user"
- **"So that" clarity:** Reveals motivation, doesn't restate the action
- **One When/Then:** If you have more, split the story
- **Testability:** Can QA verify "Then" happened?
- **INVEST:** Independent, Negotiable, Valuable, Estimable, Small, Testable

## Example

```markdown
### User Story 042:

- **Summary:** Enable Google login for trial users to reduce signup friction

#### Use Case:
- **As a** trial user visiting the app for the first time
- **I want to** log in using my Google account
- **so that** I can access the app without creating and remembering a new password

#### Acceptance Criteria:
- **Scenario:** First-time trial user logs in via Google OAuth
- **Given:** I am on the login page
- **and Given:** I have a Google account
- **When:** I click "Sign in with Google" and authorise the app
- **Then:** I am logged in and redirected to the onboarding flow
```

## Common Pitfalls

- **Technical tasks as stories:** "As a developer, I want to refactor..." → not a user story
- **Generic persona:** "As a user" → use specific role
- **"So that" restates action:** "I want to save, so that I can save" → dig into motivation
- **Multiple When/Then:** split the story
- **Untestable criteria:** "Then it's faster" → "Then the page loads in under 2 seconds"

## Related Skills
- `pm-proto-persona` — Defines the "As a [persona]" section
- `pm-problem-statement` — Stories should address validated problems
