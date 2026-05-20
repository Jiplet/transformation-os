#!/usr/bin/env node
/**
 * OfficeSpace Desk Booker
 *
 * Books your configured desk (or any available fallback on the configured floor/zone)
 * for Mon/Tue/Wed of next week. Run on Sundays. Saves session cookies — first run
 * opens a headed browser for manual SSO login, subsequent runs are headless.
 *
 * Configure via environment variables (see README.md):
 *   OFFICESPACE_URL     Base URL of your OfficeSpace tenant (no trailing slash)
 *   DESK_ID             Label of your preferred desk (e.g. "3.01.42")
 *   FALLBACK_ZONE       Desk label prefix to use as fallback floor/zone (e.g. "3.01.")
 *   EMPLOYEE_ID         Your OfficeSpace numeric employee ID
 *   SITE_ID             OfficeSpace site ID for your building
 *   FLOOR_GROUP_ID      OfficeSpace floor group ID for your floor
 *
 * Usage:
 *   node book-desk.js                        # headed, books Mon/Tue/Wed
 *   node book-desk.js --headless             # headless (requires saved session)
 *   node book-desk.js --login-only           # just refresh the session, no booking
 *   node book-desk.js --dry-run              # navigate and report availability, no booking
 *   node book-desk.js --days thu             # book Thursday only
 *   node book-desk.js --days thu,fri         # book Thursday and Friday
 *   node book-desk.js --days mon,tue,wed,thu # book Mon-Thu
 *
 * Day names: mon tue wed thu fri (comma-separated, no spaces)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ─── Config (override via environment variables) ────────────────────────────
const TENANT_URL    = process.env.OFFICESPACE_URL || 'https://YOUR-TENANT.officespacesoftware.com';
const BASE_URL      = `${TENANT_URL}/visual-directory/home`;
const GRAPHQL       = `${TENANT_URL}/graphql`;
const SESSION       = path.join(__dirname, '.session.json');
const TARGET        = process.env.DESK_ID         || 'YOUR-DESK-ID';
const FALLBACK_ZONE = process.env.FALLBACK_ZONE   || 'YOUR-ZONE-PREFIX.'; // e.g. "3.01."
const EMPLOYEE_ID   = parseInt(process.env.EMPLOYEE_ID    || '0', 10);
const SITE_ID       = process.env.SITE_ID         || 'YOUR-SITE-ID';
const FLOOR_GROUP_ID = process.env.FLOOR_GROUP_ID || 'YOUR-FLOOR-GROUP-ID';
// ───────────────────────────────────────────────────────────────────────────

const headless     = process.argv.includes('--headless');
const loginOnly    = process.argv.includes('--login-only');
const dryRun       = process.argv.includes('--dry-run');
const thisWeek     = process.argv.includes('--this-week');

// --weeks-ahead=N: book N weeks ahead (default 1 = next week)
const weeksAheadArg = process.argv.find(a => a.startsWith('--weeks-ahead=') || a === '--weeks-ahead');
const weeksAhead    = weeksAheadArg
  ? parseInt(weeksAheadArg.includes('=') ? weeksAheadArg.split('=')[1] : process.argv[process.argv.indexOf('--weeks-ahead') + 1], 10)
  : 1;

// --days flag: comma-separated day names (mon tue wed thu fri)
const DAY_OFFSETS  = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4 };
const daysArg      = process.argv.find(a => a.startsWith('--days=') || a === '--days');
const daysValue    = daysArg
  ? (daysArg.includes('=') ? daysArg.split('=')[1] : process.argv[process.argv.indexOf('--days') + 1])
  : null;
const requestedDays = daysValue
  ? daysValue.split(',').map(d => d.trim().toLowerCase()).filter(d => d in DAY_OFFSETS)
  : null; // null = use default Mon/Tue/Wed

// ─── Date helpers ──────────────────────────────────────────────────────────

function getBookingDates() {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun, 1=Mon...
  // --this-week: go back to this week's Monday; default: go forward to next Monday
  const daysToMonday = thisWeek
    ? (dow === 0 ? -6 : 1 - dow)                        // back to current week's Mon (or -6 if Sun)
    : (dow === 0 ? 1 : 8 - dow) + (weeksAhead - 1) * 7; // forward to Nth Monday ahead

  const offsets = requestedDays
    ? requestedDays.map(d => DAY_OFFSETS[d])
    : [0, 1, 2]; // default: Mon, Tue, Wed

  return offsets.map(offset => {
    const d = new Date(today);
    d.setDate(today.getDate() + daysToMonday + offset);
    return d;
  });
}

function fmt(date) {
  return date.toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}


// ─── Session helpers ───────────────────────────────────────────────────────

async function loadSession(context) {
  if (!fs.existsSync(SESSION)) return false;
  try {
    const cookies = JSON.parse(fs.readFileSync(SESSION, 'utf8'));
    await context.addCookies(cookies);
    console.log('  [session] Loaded saved cookies.');
    return true;
  } catch {
    return false;
  }
}

async function saveSession(context) {
  const cookies = await context.cookies();
  fs.writeFileSync(SESSION, JSON.stringify(cookies, null, 2));
  console.log('  [session] Cookies saved to .session.json');
}

// ─── Auth ──────────────────────────────────────────────────────────────────

async function ensureLoggedIn(page, context) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  const url = page.url();
  const loggedIn = !url.includes('login') && !url.includes('auth') && !url.includes('signin');

  if (loggedIn) {
    console.log('  [auth] Already logged in.');
    return;
  }

  if (headless) {
    throw new Error('Not logged in and running headless. Run without --headless first to save a session.');
  }

  console.log('\n  [auth] Not logged in — browser is open. Please log in via SSO (60 seconds)...');
  await page.waitForURL(
    url => {
      const s = url.toString();
      return !s.includes('login') && !s.includes('auth') && !s.includes('signin');
    },
    { timeout: 120_000 }
  );
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000); // allow SPA to settle
  await saveSession(context);
  console.log('  [auth] Login successful.\n');
}

// ─── GraphQL helper ────────────────────────────────────────────────────────

let _apiContext = null;
let _csrfToken  = null;

async function gql(page, operationName, query, variables) {
  const res = await _apiContext.post(GRAPHQL, {
    headers: {
      'Content-Type': 'application/json',
      'Referer': BASE_URL,
      'x-csrf-token': _csrfToken ?? '',
    },
    data: JSON.stringify({ operationName, query, variables }),
  });
  const text = await res.text();
  if (res.status() !== 200 || !text.startsWith('{')) {
    console.log(`  [gql] status=${res.status()} body=${text.slice(0, 400)}`);
    return {};
  }
  return JSON.parse(text);
}

// ─── Booking ───────────────────────────────────────────────────────────────

function scheduleForDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return [{ date: `${y}-${m}-${d}T12:00:00`, checkIn: '08:00', checkOut: '23:45' }];
}

async function findSeatId(page, date) {
  console.log('  [api] Querying available desks...');
  const res = await gql(page, 'AvailableDesks',
    `query AvailableDesks($employeeId: ID!, $featureIds: [ID!], $floorGroupId: ID, $schedule: [SeatBookingSeriesItemType!]!, $siteId: ID!) {
      availableBookableDesksSummary(
        employeeId: $employeeId
        featureIds: $featureIds
        floorGroupId: $floorGroupId
        schedule: $schedule
        siteId: $siteId
      ) {
        id
        availableDeskIds
        availableSelfServiceCount
        __typename
      }
    }`,
    {
      employeeId: EMPLOYEE_ID,
      siteId: SITE_ID,
      floorGroupId: FLOOR_GROUP_ID,
      schedule: scheduleForDate(date),
    }
  );

  const deskIds = (res.data?.availableBookableDesksSummary ?? []).flatMap(s => s.availableDeskIds ?? []);
  console.log(`  [api] ${deskIds.length} available desks found.`);

  if (deskIds.length === 0) return { seatId: null, label: null };

  // Look up labels for all available desks
  const seatsRes = await gql(page, 'SeatLabels',
    `query SeatLabels($ids: [ID!]!) { seats(ids: $ids) { id label } }`,
    { ids: deskIds }
  );
  const seats = seatsRes.data?.seats ?? [];

  const target = seats.find(s => s.label === TARGET);
  if (target) {
    console.log(`  [api] Found target desk ${TARGET} -> seatId ${target.id}`);
    return { seatId: target.id, label: target.label };
  }

  // Fallback: first available desk in the configured zone
  const fallbackSeats = seats.filter(s => s.label && s.label.startsWith(FALLBACK_ZONE));
  if (fallbackSeats.length === 0) {
    console.log(`  [api] No desks available in fallback zone (${FALLBACK_ZONE}) on this day — skipping.`);
    return { seatId: null, label: null };
  }
  const fallback = fallbackSeats[0];
  console.log(`  [api] Target ${TARGET} not available — fallback: ${fallback.label} (${fallback.id})`);
  return { seatId: fallback.id, label: fallback.label };
}

async function bookDate(page, date) {
  const label = fmt(date);
  console.log(`\n  Booking ${label}...`);

  const { seatId, label: deskLabel } = await findSeatId(page, date);

  if (!seatId) {
    console.log('  [book] No available desks found.');
    return { date: label, desk: null, success: false };
  }

  if (dryRun) {
    console.log(`  [dry-run] Would book seatId ${seatId} (${deskLabel})`);
    return { date: label, desk: deskLabel, success: true };
  }

  console.log(`  [api] Creating booking for seatId ${seatId} (${deskLabel})...`);
  const res = await gql(page, 'CreateBookingSeries',
    `mutation CreateBookingSeries($employeeId: ID!, $schedule: [SeatBookingSeriesItemType!]!, $seatId: ID!, $waiveConfirmation: Boolean) {
      createSeatBookingSeries(
        employeeId: $employeeId
        schedule: $schedule
        seatId: $seatId
        waiveConfirmation: $waiveConfirmation
      ) {
        __typename
      }
    }`,
    {
      employeeId: EMPLOYEE_ID,
      seatId,
      schedule: scheduleForDate(date),
      waiveConfirmation: false,
    }
  );

  if (res.errors?.length) {
    console.log(`  [book] Error: ${res.errors[0].message}`);
    return { date: label, desk: deskLabel, success: false };
  }

  console.log(`  [book] Booked ${deskLabel}`);
  return { date: label, desk: deskLabel, success: true };
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const dates = getBookingDates();
  console.log(`\n=== OfficeSpace Desk Booker ===`);
  console.log(`Tenant      : ${TENANT_URL}`);
  console.log(`Target desk : ${TARGET}`);
  console.log(`Dates       : ${dates.map(d => fmt(d)).join(', ')}`);
  if (dryRun) console.log('Mode        : DRY RUN (no bookings will be made)');
  console.log('');

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  await loadSession(context);
  _apiContext = context.request;
  const page = await context.newPage();

  try {
    // Intercept a real GraphQL request to capture the CSRF token
    page.on('request', req => {
      if (req.url() === GRAPHQL && req.method() === 'POST' && !_csrfToken) {
        const token = req.headers()['x-csrf-token'];
        if (token) {
          _csrfToken = token;
          console.log('  [auth] CSRF token captured.');
        }
      }
    });

    await ensureLoggedIn(page, context);

    // If no CSRF token yet, wait for the page to make a real request
    if (!_csrfToken) {
      await page.waitForTimeout(3000);
    }
    if (!_csrfToken) {
      throw new Error('Could not capture CSRF token. Try running without --headless first.');
    }

    if (loginOnly) {
      console.log('  [done] Login-only mode complete.');
      await browser.close();
      return;
    }

    const results = [];
    for (const date of dates) {
      const result = await bookDate(page, date);
      results.push(result);
    }

    console.log('\n=== Summary ===');
    for (const r of results) {
      const icon = r.success ? 'OK' : 'FAIL';
      const desk = r.desk ?? 'none available';
      console.log(`  [${icon}]  ${r.date}  ->  ${desk}`);
    }

    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      console.log(`\n  ${failed.length} booking(s) failed. Check the output above.`);
      process.exit(1);
    }

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('\n[error]', err.message);
  process.exit(1);
});
