# OfficeSpace Desk Booker

A fork-and-adapt Claude Code skill that automates desk booking via the OfficeSpace GraphQL API using Playwright.

The original was built for an office on a specific campus, but the patterns are reusable for any OfficeSpace deployment. Configure your tenant URL, desk IDs, and employee/site identifiers via environment variables and you're done.

## How it works

1. First run: opens a headed browser so you can complete SSO login manually. Session cookies are saved to `.session.json`.
2. Subsequent runs: headless, reusing the saved session. Re-run headed when the session expires.
3. Books your configured target desk (or the best available fallback within your zone) via the OfficeSpace GraphQL API.

## Required environment variables

| Variable | Description | Example |
|---|---|---|
| `OFFICESPACE_URL` | Base URL of your OfficeSpace tenant (no trailing slash) | `https://acme.officespacesoftware.com` |
| `DESK_ID` | Label of your preferred desk | `3.01.42` |
| `FALLBACK_ZONE` | Desk label prefix for the fallback zone/floor | `3.01.` |
| `EMPLOYEE_ID` | Your OfficeSpace numeric employee ID | `12345` |
| `SITE_ID` | OfficeSpace site ID for your building | `1` |
| `FLOOR_GROUP_ID` | OfficeSpace floor group ID for your floor | `2` |

### Additional variables for book-batch.js

| Variable | Description | Example |
|---|---|---|
| `DESK_PREFS` | Comma-separated desk preference list (best first) | `3.01.42,3.01.40,3.01.44` |
| `BATCH_END_DATE` | Last date to book up to | `2026-09-30` |

### Additional variables for book-wed.js

| Variable | Description | Example |
|---|---|---|
| `BOOK_DATE` | Specific date to book (YYYY-MM-DD) | `2026-06-04` |
| `DESK_PREFS` | Comma-separated desk preference list | `3.01.42,3.01.40` |

## Finding your IDs

The easiest way to find `EMPLOYEE_ID`, `SITE_ID`, and `FLOOR_GROUP_ID` is to:

1. Open your OfficeSpace tenant in a browser with DevTools open.
2. Navigate to the desk booking page and filter by your floor.
3. Watch the Network tab for GraphQL requests to `/graphql` — the variables in `AvailableDesks` queries will contain your site and floor group IDs.
4. Your employee ID appears in booking mutation payloads.

## Setup

```bash
# Install dependencies
npm install
npx playwright install chromium

# Set environment variables (or export them in your shell profile)
export OFFICESPACE_URL="https://acme.officespacesoftware.com"
export DESK_ID="3.01.42"
export FALLBACK_ZONE="3.01."
export EMPLOYEE_ID="12345"
export SITE_ID="1"
export FLOOR_GROUP_ID="2"

# First run — headed browser, complete SSO login when prompted
node book-desk.js

# Subsequent runs — headless
node book-desk.js --headless
```

## Scripts

| Script | Description |
|---|---|
| `book-desk.js` | Books Mon/Tue/Wed of next week (configurable via `--days`) |
| `book-batch.js` | Books Mon/Tue/Wed from next week through a configurable end date |
| `book-wed.js` | Books a single specific date with preference list and persistence verification |

## CLI options (book-desk.js)

```
--headless              Run headless (requires saved session)
--login-only            Refresh session only, no booking
--dry-run               Report availability without booking
--days mon,tue,wed      Override which days to book
--this-week             Book current week instead of next week
--weeks-ahead=N         Book N weeks ahead (default: 1)
```

## Session management

The saved session is stored in `.session.json` (git-ignored). It contains browser cookies from your SSO login. When it expires, delete it and re-run headed:

```bash
rm .session.json && node book-desk.js
```

Do not commit `.session.json` to version control — it contains your authentication tokens.

## Background

Originally built for the Victoria Cross campus OfficeSpace deployment. The GraphQL API shape (AvailableDesks, SeatLabels, CreateBookingSeries, DayBookings) is consistent across OfficeSpace tenants, so the approach should work for any company running OfficeSpace.
