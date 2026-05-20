#!/usr/bin/env node
/**
 * Batch desk booker — configured zone only, with persistence verification.
 *
 * Books Mon/Tue/Wed from next Monday through END_DATE (inclusive) on a desk
 * within the configured zone prefix. Prefers the usual desk, then tries
 * alternatives in order. NEVER books outside the configured zone — if no
 * matching desk is free that day, the day is SKIPPED.
 *
 * Every booking is re-queried to confirm it actually persisted (the
 * CreateBookingSeries mutation returns no error on silent failures).
 * Idempotent: a day already holding a booking in the target zone is left as-is.
 *
 * Configure via environment variables (see README.md):
 *   OFFICESPACE_URL     Base URL of your OfficeSpace tenant
 *   EMPLOYEE_ID         Your OfficeSpace numeric employee ID
 *   SITE_ID             OfficeSpace site ID for your building
 *   FLOOR_GROUP_ID      OfficeSpace floor group ID for your floor
 *   FALLBACK_ZONE       Desk label prefix to restrict bookings to (e.g. "3.01.")
 *   DESK_PREFS          Comma-separated desk label preference list
 *   BATCH_END_DATE      Last date to book up to (YYYY-MM-DD, default 8 weeks from today)
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

// Zone prefix — only desks whose label starts with this string will be booked
const ZONE = process.env.FALLBACK_ZONE || 'YOUR-ZONE-PREFIX.';

// Preference list: usual desk first, then alternatives in priority order
const PREF = (process.env.DESK_PREFS || 'YOUR-DESK-ID').split(',').map(s => s.trim());

// Batch end date — how far ahead to book (default: ~8 weeks)
const defaultEnd = new Date();
defaultEnd.setDate(defaultEnd.getDate() + 56);
const END_DATE = process.env.BATCH_END_DATE
  ? new Date(process.env.BATCH_END_DATE + 'T00:00:00')
  : defaultEnd;
// ─────────────────────────────────────────────────────────────────────────────

let _api = null, _csrf = null;

async function gql(op, query, variables) {
  const res = await _api.post(GRAPHQL, {
    headers: { 'Content-Type': 'application/json', 'Referer': BASE_URL, 'x-csrf-token': _csrf ?? '' },
    data: JSON.stringify({ operationName: op, query, variables })
  });
  const t = await res.text();
  try { return JSON.parse(t); } catch { return { __raw: t, __status: res.status() }; }
}

const pad = n => String(n).padStart(2, '0');
const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtOf = d => d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

function bookingDates() {
  const today = new Date();
  const dow = today.getDay();                    // 0=Sun..6=Sat
  const toMon = dow === 0 ? 1 : (8 - dow) % 7 || 7; // days to NEXT Monday
  const start = new Date(today);
  start.setDate(today.getDate() + toMon);
  start.setHours(0, 0, 0, 0);
  const out = [];
  for (let d = new Date(start); d <= END_DATE; d.setDate(d.getDate() + 1)) {
    const wd = d.getDay();
    if (wd >= 1 && wd <= 3) out.push(new Date(d)); // Mon/Tue/Wed
  }
  return out;
}

function sched(iso) { return [{ date: `${iso}T12:00:00`, checkIn: '08:00', checkOut: '23:45' }]; }

async function dayBooking(iso) {
  const r = await gql('DayBookings',
    `query DayBookings($periodStart: TimeZoneAgnosticDate, $periodEnd: TimeZoneAgnosticDate, $notRejected: Boolean){
      currentUser { id bookings(periodStart:$periodStart, periodEnd:$periodEnd, notRejected:$notRejected){
        ... on SeatOpenBooking { id seat { id label } } __typename } } }`,
    { periodStart: `${iso}T00:00:00.000+00:00`, periodEnd: `${iso}T23:59:59.999+00:00`, notRejected: true });
  return (r.data?.currentUser?.bookings || []).filter(x => x.__typename === 'SeatOpenBooking');
}

async function availInZone(iso) {
  const ad = await gql('AvailableDesks',
    `query AvailableDesks($employeeId: ID!, $floorGroupId: ID, $schedule: [SeatBookingSeriesItemType!]!, $siteId: ID!){
      availableBookableDesksSummary(employeeId:$employeeId, floorGroupId:$floorGroupId, schedule:$schedule, siteId:$siteId){ id availableDeskIds } }`,
    { employeeId: EMPLOYEE_ID, siteId: SITE_ID, floorGroupId: FLOOR_GROUP_ID, schedule: sched(iso) });
  const ids = (ad.data?.availableBookableDesksSummary || []).flatMap(s => s.availableDeskIds || []);
  if (!ids.length) return { map: {}, total: 0 };
  const sl = await gql('SeatLabels', `query SeatLabels($ids:[ID!]!){seats(ids:$ids){id label}}`, { ids });
  const map = {};
  for (const s of (sl.data?.seats || [])) if (s.label && s.label.startsWith(ZONE)) map[s.label] = s.id;
  return { map, total: ids.length };
}

(async () => {
  const dates = bookingDates();
  console.log(`=== Batch booker — zone: ${ZONE} ===`);
  console.log(`Range : ${fmtOf(dates[0])} -> ${fmtOf(dates[dates.length - 1])}  (${dates.length} days, Mon/Tue/Wed)\n`);

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
  if (!_csrf) { console.log('NO CSRF — session likely expired. Re-run book-desk.js headed.'); await b.close(); process.exit(1); }

  const results = [];
  for (const d of dates) {
    const iso = isoOf(d), label = fmtOf(d);
    const row = { label, iso, status: '', desk: null, id: null };
    const existing = await dayBooking(iso);
    const hasZone = existing.find(x => x.seat.label && x.seat.label.startsWith(ZONE));
    if (hasZone) {
      row.status = 'already'; row.desk = hasZone.seat.label; row.id = hasZone.id;
      console.log(`${label}: already booked ${hasZone.seat.label} (id ${hasZone.id}) — kept`);
      results.push(row); continue;
    }
    if (existing.length) {
      row.status = 'other'; row.desk = existing[0].seat.label;
      console.log(`${label}: booking exists outside target zone (${existing[0].seat.label}) — left alone, FLAG`);
      results.push(row); continue;
    }

    const { map, total } = await availInZone(iso);
    const cands = [...PREF.filter(l => map[l]), ...Object.keys(map).filter(l => !PREF.includes(l)).sort()];
    if (!cands.length) {
      row.status = total === 0 ? 'horizon' : 'nozone';
      console.log(`${label}: ${total === 0 ? 'NO availability at all (booking horizon?)' : 'no desk in zone free'} — SKIPPED`);
      results.push(row); continue;
    }

    let done = false;
    for (const lbl of cands) {
      const sid = map[lbl];
      const res = await gql('CreateBookingSeries',
        `mutation CreateBookingSeries($employeeId: ID!, $schedule: [SeatBookingSeriesItemType!]!, $seatId: ID!, $waiveConfirmation: Boolean){
          createSeatBookingSeries(employeeId:$employeeId, schedule:$schedule, seatId:$seatId, waiveConfirmation:$waiveConfirmation){ __typename } }`,
        { employeeId: EMPLOYEE_ID, seatId: sid, schedule: sched(iso), waiveConfirmation: false });
      if (res.errors?.length) { console.log(`${label}: ${lbl} mutation error: ${res.errors[0].message}`); continue; }
      await p.waitForTimeout(1200);
      const post = await dayBooking(iso);
      const hit = post.find(x => x.seat.label === lbl);
      if (hit) {
        row.status = 'booked'; row.desk = lbl; row.id = hit.id;
        console.log(`${label}: BOOKED ${lbl} (id ${hit.id}) — verified`);
        done = true; break;
      }
      console.log(`${label}: ${lbl} did not persist (silent fail) — next candidate`);
    }
    if (!done) { row.status = 'failed'; console.log(`${label}: could not verify-book any desk in zone — SKIPPED`); }
    results.push(row);
  }

  console.log('\n=== SUMMARY ===');
  const tag = { booked: 'NEW  OK', already: 'KEPT OK', nozone: 'SKIP (no zone desk)', horizon: 'SKIP (horizon)', failed: 'SKIP (fail)', other: 'FLAG (outside zone)' };
  for (const r of results) console.log(`  ${(tag[r.status] || r.status).padEnd(20)} ${r.label.padEnd(22)} ${r.desk ? ('-> ' + r.desk + (r.id ? (' (id ' + r.id + ')') : '')) : ''}`);
  const ct = k => results.filter(r => r.status === k).length;
  console.log(`\n  new=${ct('booked')}  kept=${ct('already')}  skipped(nozone)=${ct('nozone')}  skipped(horizon)=${ct('horizon')}  failed=${ct('failed')}  flagged=${ct('other')}`);
  await b.close();
})().catch(e => { console.error('[err]', e.message); process.exit(1); });
