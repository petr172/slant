import type { APIRoute } from 'astro'

// On-demand (serverless) — nesmí se prerenderovat staticky
export const prerender = false

// ── Google OAuth (refresh token flow) ────────────────────────────────────────
// Setup: Google Cloud projekt s Calendar API + OAuth client (Desktop/Web),
// jednorázově získaný refresh token s scope
// https://www.googleapis.com/auth/calendar.events + calendar.freebusy
const GOOGLE_CLIENT_ID     = import.meta.env.GOOGLE_CLIENT_ID ?? ''
const GOOGLE_CLIENT_SECRET = import.meta.env.GOOGLE_CLIENT_SECRET ?? ''
const GOOGLE_REFRESH_TOKEN = import.meta.env.GOOGLE_REFRESH_TOKEN ?? ''
const CALENDAR_ID          = import.meta.env.GOOGLE_CALENDAR_ID ?? 'primary'

// ── Pravidla bookingu ────────────────────────────────────────────────────────
const TZ            = 'Europe/Prague'
const SLOT_STEP_MIN = 30   // nabídka po 30 minutách
const DURATION_MIN  = 30   // délka callu
const LEAD_HOURS    = 12   // nejdřív za 12 h od teď
const HORIZON_DAYS  = 21   // nabízej 3 týdny dopředu

// Dostupnost podle dne v týdnu (0 = Ne … 6 = So). Zrcadlí Google
// Appointment Schedule. Každý den = pole oken [začátekMin, konecMin]
// (minuty od půlnoci, pražský čas). Konec = poslední slot musí skončit ≤ konec.
const AVAILABILITY: Record<number, Array<[number, number]>> = {
  1: [[11 * 60, 14 * 60]],                    // Po 11:00–14:00
  3: [[9 * 60, 13 * 60], [15 * 60, 17 * 60]], // St 9:00–13:00 + 15:00–17:00
  5: [[9 * 60, 17 * 60]],                     // Pá 9:00–17:00
  // Út, Čt, So, Ne = zavřeno
}
const WEEKDAY_NUM: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

/** Je daný počet minut od půlnoci platný začátek slotu pro daný den v týdnu? */
function slotAllowed(weekday: number, minsFromMidnight: number): boolean {
  const windows = AVAILABILITY[weekday]
  if (!windows) return false
  if (minsFromMidnight % SLOT_STEP_MIN !== 0) return false
  return windows.some(([s, e]) => minsFromMidnight >= s && minsFromMidnight + DURATION_MIN <= e)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

// ── Timezone helpers (Workers nemají moment/luxon — čistý Intl) ─────────────
/** Offset (ms) časové zóny TZ vůči UTC v daném okamžiku. */
function tzOffsetMs(atUtc: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const p = Object.fromEntries(dtf.formatToParts(atUtc).map(x => [x.type, x.value]))
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +(p.hour === '24' ? 0 : p.hour), +p.minute, +p.second)
  return asUtc - atUtc.getTime()
}

/** UTC okamžik odpovídající pražskému wall-času (y-m-d h:mm). */
function pragueTime(y: number, m: number, d: number, h: number, min: number): Date {
  // dvě iterace kvůli DST přechodům
  let guess = new Date(Date.UTC(y, m - 1, d, h, min))
  guess = new Date(Date.UTC(y, m - 1, d, h, min) - tzOffsetMs(guess))
  return new Date(Date.UTC(y, m - 1, d, h, min) - tzOffsetMs(guess))
}

/** Pražské datum (y, m, d, weekday) pro daný UTC okamžik. */
function pragueDate(atUtc: Date) {
  const dtf = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
  const p = Object.fromEntries(dtf.formatToParts(atUtc).map(x => [x.type, x.value]))
  return { y: +p.year, m: +p.month, d: +p.day, wd: p.weekday as string }
}

// ── Google API ───────────────────────────────────────────────────────────────
async function accessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`OAuth token failed: ${res.status} ${await res.text()}`)
  const data = await res.json() as { access_token?: string }
  if (!data.access_token) throw new Error('OAuth: no access_token')
  return data.access_token
}

async function busyIntervals(token: string, timeMin: Date, timeMax: Date): Promise<Array<{ s: number; e: number }>> {
  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString(), items: [{ id: CALENDAR_ID }] }),
  })
  if (!res.ok) throw new Error(`freeBusy failed: ${res.status} ${await res.text()}`)
  const data = await res.json() as any
  const busy = data?.calendars?.[CALENDAR_ID]?.busy ?? data?.calendars?.[Object.keys(data?.calendars ?? {})[0]]?.busy ?? []
  return busy.map((b: any) => ({ s: Date.parse(b.start), e: Date.parse(b.end) }))
}

/** Všechny nabízitelné sloty v horizontu (bez kolize s busy). */
function buildSlots(busy: Array<{ s: number; e: number }>) {
  const now = Date.now()
  const earliest = now + LEAD_HOURS * 3600_000
  const days: Array<{ date: string; label: string; slots: Array<{ start: string; label: string }> }> = []

  for (let dayOffset = 0; dayOffset <= HORIZON_DAYS; dayOffset++) {
    const probe = new Date(now + dayOffset * 86400_000)
    const { y, m, d, wd } = pragueDate(probe)
    const weekday = WEEKDAY_NUM[wd]
    if (!AVAILABILITY[weekday]) continue

    const slots: Array<{ start: string; label: string }> = []
    const dayEnd = Math.max(...AVAILABILITY[weekday].map(w => w[1]))
    for (let mins = 0; mins + DURATION_MIN <= dayEnd; mins += SLOT_STEP_MIN) {
      if (!slotAllowed(weekday, mins)) continue
      const start = pragueTime(y, m, d, Math.floor(mins / 60), mins % 60)
      const s = start.getTime()
      const e = s + DURATION_MIN * 60_000
      if (s < earliest) continue
      if (busy.some(b => s < b.e && e > b.s)) continue
      const hh = String(Math.floor(mins / 60)).padStart(2, '0')
      const mm = String(mins % 60).padStart(2, '0')
      slots.push({ start: start.toISOString(), label: `${hh}:${mm}` })
    }
    if (slots.length) {
      days.push({ date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, label: '', slots })
    }
  }
  return days
}

// ── GET /api/booking → volné sloty ───────────────────────────────────────────
export const GET: APIRoute = async () => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    return json({ available: false, message: 'Booking not configured' }, 503)
  }
  try {
    const token = await accessToken()
    const timeMin = new Date()
    const timeMax = new Date(Date.now() + (HORIZON_DAYS + 1) * 86400_000)
    const busy = await busyIntervals(token, timeMin, timeMax)
    return json({ available: true, tz: TZ, durationMin: DURATION_MIN, days: buildSlots(busy) })
  } catch (err) {
    console.error('[booking:GET]', err)
    return json({ available: false, message: 'Booking temporarily unavailable' }, 502)
  }
}

// ── POST /api/booking → vytvoř event + Meet ─────────────────────────────────
interface BookPayload { start?: string; name?: string; email?: string; note?: string; lang?: string; botcheck?: boolean }

export const POST: APIRoute = async ({ request }) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    return json({ success: false, message: 'Booking not configured' }, 503)
  }
  let body: BookPayload
  try { body = await request.json() } catch { return json({ success: false, message: 'Invalid JSON' }, 400) }

  if (body.botcheck) return json({ success: true }) // honeypot — tiše „uspěj“
  const name = (body.name ?? '').trim().slice(0, 120)
  const email = (body.email ?? '').trim()
  const note = (body.note ?? '').trim().slice(0, 1000)
  const lang = body.lang === 'en' ? 'en' : 'cs'
  const startMs = Date.parse(body.start ?? '')

  if (!name) return json({ success: false, message: 'Missing name' }, 400)
  if (!EMAIL_RE.test(email)) return json({ success: false, message: 'Invalid email' }, 400)
  if (!Number.isFinite(startMs)) return json({ success: false, message: 'Invalid start' }, 400)

  // Slot musí odpovídat mřížce a pravidlům (nikdy nevěř klientovi)
  if (startMs < Date.now() + LEAD_HOURS * 3600_000) return json({ success: false, message: 'Slot too soon' }, 400)
  if (startMs > Date.now() + (HORIZON_DAYS + 1) * 86400_000) return json({ success: false, message: 'Slot too far' }, 400)
  const startDate = new Date(startMs)
  const { y, m, d, wd } = pragueDate(startDate)
  const dayStartMs = pragueTime(y, m, d, 0, 0).getTime()
  const minsFromMidnight = Math.round((startMs - dayStartMs) / 60_000)
  if (!slotAllowed(WEEKDAY_NUM[wd], minsFromMidnight)) {
    return json({ success: false, message: 'Invalid slot' }, 400)
  }

  const endMs = startMs + DURATION_MIN * 60_000
  try {
    const token = await accessToken()
    // double-booking guard: znovu ověř, že interval je volný
    const busy = await busyIntervals(token, startDate, new Date(endMs))
    if (busy.some(b => startMs < b.e && endMs > b.s)) {
      return json({ success: false, code: 'taken', message: 'Slot already taken' }, 409)
    }

    const summary = lang === 'en' ? `Discovery call — ${name} × Slant` : `Discovery call — ${name} × Slant`
    const description = [
      lang === 'en' ? '30-minute intro call booked via slant.cz.' : '30minutový úvodní hovor rezervovaný přes slant.cz.',
      note ? `\n${lang === 'en' ? 'Note' : 'Poznámka'}: ${note}` : '',
    ].join('')

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?conferenceDataVersion=1&sendUpdates=all`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          description,
          start: { dateTime: new Date(startMs).toISOString(), timeZone: TZ },
          end:   { dateTime: new Date(endMs).toISOString(),   timeZone: TZ },
          attendees: [{ email, displayName: name }],
          conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } } },
          reminders: { useDefault: true },
        }),
      }
    )
    if (!res.ok) throw new Error(`event create failed: ${res.status} ${await res.text()}`)
    const event = await res.json() as any
    return json({ success: true, meetUrl: event.hangoutLink ?? null, htmlLink: event.htmlLink ?? null })
  } catch (err) {
    console.error('[booking:POST]', err)
    return json({ success: false, message: 'Booking failed' }, 502)
  }
}
