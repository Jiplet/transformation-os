---
name: book-desk
description: Book office desks via OfficeSpace API for configured days of the week (default Mon/Tue/Wed). Use when the user asks to book desks, book their desk, or run the desk booker.
---

# Desk Booker

Books the configured desk (or a fallback from the configured zone/floor) for Mon/Tue/Wed of next week via the OfficeSpace GraphQL API.

Configure your desk ID and tenant URL via environment variables before running (see README.md).

## Step 1: Check session

```bash
ls ~/.claude/skills/desk-booker/.session.json 2>/dev/null && echo "Session found" || echo "No session"
```

## Step 2: Run

Session exists — run headless:
```bash
cd ~/.claude/skills/desk-booker && node book-desk.js --headless
```

No session (first run or expired) — run headed for SSO login:
```bash
cd ~/.claude/skills/desk-booker && node book-desk.js
```

## Step 3: Report

Summarise which desks were booked per day, any failures, and whether the configured target desk or a fallback was used.

## Troubleshooting

Session expired:
```bash
rm ~/.claude/skills/desk-booker/.session.json && cd ~/.claude/skills/desk-booker && node book-desk.js
```
