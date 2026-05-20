#!/usr/bin/env node
/**
 * Single-day desk booker with persistence verification.
 *
 * Books a specific date on a desk from the configured preference list,
 * trying each in order. Verifies each booking actually persisted before
 * declaring success (the CreateBookingSeries mutation can silently fail).
 *
 * Configure via environment variables (see README.md):
 *   OFFICESPACE_URL     Base URL of your OfficeSpace tenant
 *   EMPLOYEE_ID         Your OfficeSpace numeric employee ID
 *   SITE_ID             OfficeSpace site ID for your building
 *   FLOOR_GROUP_ID      OfficeSpace floor group ID for your floor
 *
 * Edit BOOK_DATE and PREF below to target a specific date and desk preference list.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ─── Config ─────────────────────────────────────────────────────────────────
const TENANT_URL     = process.env.OFFICESPACE_URL  || 'https://YOUR-TENANT.officespacesoftware.com';
const BASE_URL       = `${TENANT_URL}/visual-directory/home`;
const GRAPHQL        = `${TENANT_URL}/graphql`;
const SESSION        = path.join(__dirname, '.session.json');
const EMPLOYEE_ID    = parseInt(process.env.EMPLOYEE_ID    || '0', 10);
const SITE_ID        = process.env.SITE_ID          || 'YOUR-SITE-ID';
const FLOOR_GROUP_ID = process.env.FLOOR_GROUP_ID   || 'YOUR-FLOOR-GROUP-ID';

// Target date — edit to the date you want to book (YYYY-MM-DD)
const BOOK_DATE = process.env.BOOK_DATE || 'YYYY-MM-DD';

// Preference order: your usual desk first, then alternatives in priority order
const PREF = (process.env.DESK_PREFS || 'YOUR-DESK-ID').split(',').map(s => s.trim());
// ─────────────────────────────────────────────────────────────────────────────

let _api = null, _csrf = null;

async function gql(op, query, variables) {
  const res = await _api.post(GRAPHQL, {
    headers: { 'Content-Type': 'application/json', 'Referer': BASE_URL, 'x-csrf-token': _csrf ?? '' },
    data: JSON.stringify({ operationName: op, query, variables })
  });
  const t = await res.text();
  try { return JSON.parse(t); } catch { return { __raw: t }; }
}

const sched = [{ date: `${BOOK_DATE}T12:00:00`, checkIn: '08:00', checkOut: '23:45' }];

async function dayBooking() {
  const r = await gql('DayBookings',
    `query DayBookings($periodStart: TimeZoneAgnosticDate, $periodEnd: TimeZoneAgnosticDate, $notRejected: Boolean) {
      currentUser { id bookings(periodStart:$periodStart, periodEnd:$periodEnd, notRejected:$notRejected) {
        ... on SeatOpenBooking { id key seat { id label } } __typename } } }`,
    { periodStart: `${BOOK_DATE}T00:00:00.000+00:00`, periodEnd: `${BOOK_DATE}T23:59:59.999+00:00`, notRejected: true });
  return (r.data?.currentUser?.bookings || []).filter(x => x.__typename === 'SeatOpenBooking');
}

(async () => {
  const b = await chromium.launch({ headless: true });
  const c = await b.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  await c.addCookies(JSON.parse(fs.readFileSync(SESSION, 'utf8')));
  _api = c.request;
  const p = await c.newPage();
  p.on('request', r => { if (r.url() === GRAPHQL && r.method() === 'POST' && !_csrf) { const t = r.headers()['x-csrf-token']; if (t) _csrf = t; } });
  await p.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);
  if (!_csrf) { console.log('NO CSRF — session likely expired.'); await b.close(); process.exit(1); }

  const pre = await dayBooking();
  console.log(`Pre-state ${BOOK_DATE}:`, pre.length ? pre.map(x => x.seat.label + ' (id ' + x.id + ')').join(', ') : '(empty)');
  if (pre.length) { console.log('Existing booking found — aborting, manual review needed.'); await b.close(); process.exit(1); }

  // available desk ids for the target date
  const ad = await gql('AvailableDesks',
    `query AvailableDesks($employeeId: ID!, $floorGroupId: ID, $schedule: [SeatBookingSeriesItemType!]!, $siteId: ID!) {
      availableBookableDesksSummary(employeeId:$employeeId, floorGroupId:$floorGroupId, schedule:$schedule, siteId:$siteId) { id availableDeskIds } }`,
    { employeeId: EMPLOYEE_ID, siteId: SITE_ID, floorGroupId: FLOOR_GROUP_ID, schedule: sched });
  const ids = (ad.data?.availableBookableDesksSummary || []).flatMap(s => s.availableDeskIds || []);
  const sl = await gql('SeatLabels', `query SeatLabels($ids:[ID!]!){seats(ids:$ids){id label}}`, { ids });
  const byLabel = {};
  for (const s of (sl.data?.seats || [])) byLabel[s.label] = s.id;

  let booked = null;
  for (const lbl of PREF) {
    const sid = byLabel[lbl];
    if (!sid) { console.log(`skip ${lbl} — not available`); continue; }
    console.log(`Attempting ${lbl} (seatId ${sid})...`);
    const res = await gql('CreateBookingSeries',
      `mutation CreateBookingSeries($employeeId: ID!, $schedule: [SeatBookingSeriesItemType!]!, $seatId: ID!, $waiveConfirmation: Boolean) {
        createSeatBookingSeries(employeeId:$employeeId, schedule:$schedule, seatId:$seatId, waiveConfirmation:$waiveConfirmation) { __typename } }`,
      { employeeId: EMPLOYEE_ID, seatId: sid, schedule: sched, waiveConfirmation: false });
    if (res.errors?.length) { console.log(`  mutation error: ${res.errors[0].message}`); continue; }
    await p.waitForTimeout(1500);
    const post = await dayBooking();
    const hit = post.find(x => x.seat.label === lbl);
    if (hit) { console.log(`  VERIFIED ${lbl} persisted (booking id ${hit.id})`); booked = { label: lbl, id: hit.id }; break; }
    console.log(`  NOT persisted (silent fail) — trying next`);
  }

  console.log('\n=== RESULT ===');
  if (booked) console.log(`${BOOK_DATE} -> ${booked.label} (booking id ${booked.id}) — verified`);
  else console.log(`FAILED: no desk could be verified-booked for ${BOOK_DATE}.`);
  await b.close();
  process.exit(booked ? 0 : 1);
})().catch(e => { console.error('[err]', e.message); process.exit(1); });
