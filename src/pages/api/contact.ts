import type { APIRoute } from 'astro'
import { Resend } from 'resend'

// On-demand (serverless) — nesmí se prerenderovat staticky
export const prerender = false

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY ?? ''
// Odesílatel — musí být na ověřené doméně v Resend (např. "Slant <hello@slant.cz>")
const RESEND_FROM = import.meta.env.RESEND_FROM ?? 'Slant <hello@slant.cz>'
// Interní příjemce notifikací o nových poptávkách
const CONTACT_TO = import.meta.env.CONTACT_TO ?? 'hello@slant.cz'
// Google Workspace Appointment Schedules — veřejný booking odkaz
const BOOKING_URL = import.meta.env.BOOKING_URL ?? 'https://calendar.app.google/'
// Cloudflare Turnstile — server-side secret (pokud prázdné, ověření se přeskočí)
const TURNSTILE_SECRET = import.meta.env.TURNSTILE_SECRET_KEY ?? ''
// Limit přílohy (base64) — drží request pod ~4,5 MB limitem Vercelu
const MAX_ATTACH_BYTES = 4 * 1024 * 1024

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const BRAND = '#FF5522' // = --clr-accent

type Lang = 'cs' | 'en'

interface Attachment { filename?: string; contentType?: string; data?: string }
interface ContactPayload {
  name?: string
  email?: string
  services?: string | string[]
  message?: string
  lang?: string
  botcheck?: boolean
  elapsedMs?: number
  turnstileToken?: string
  attachment?: Attachment | null
}

async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true // ověření vypnuté (žádný klíč)
  if (!token) return false
  try {
    const body = new URLSearchParams({ secret: TURNSTILE_SECRET, response: token })
    if (ip) body.set('remoteip', ip)
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
    const data = await r.json()
    return !!data.success
  } catch {
    return false
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ── Personalizovaný blok podle vybrané služby ────────────────────────────────
function serviceBlock(services: string[], lang: Lang): string {
  const s = services.map((x) => x.toLowerCase())
  const has = (k: string) => s.some((x) => x.includes(k))

  const items: string[] = []
  const push = (cs: string, en: string) => items.push(lang === 'cs' ? cs : en)

  if (has('brand'))
    push(
      'U brandingu obvykle začínáme strategií a positioningem, než se pustíme do vizuální identity — rád/a vám ukážu, jak to vypadá u <a href="https://slant.cz/work/jatvar" style="color:' +
        BRAND +
        '">Jatvaru</a>.',
      'For branding we usually start with strategy and positioning before the visual identity — happy to show how that looked for <a href="https://slant.cz/en/work/jatvar" style="color:' +
        BRAND +
        '">Jatvar</a>.',
    )
  if (has('web'))
    push(
      'U webdesignu řešíme UX, obsah i technické provedení — podívejte se na <a href="https://slant.cz/work/data-jmk" style="color:' +
        BRAND +
        '">Data JMK</a>.',
      'For web design we cover UX, content and build — take a look at <a href="https://slant.cz/en/work/data-jmk" style="color:' +
        BRAND +
        '">Data JMK</a>.',
    )
  if (has('packag'))
    push(
      'U obalového designu propojujeme značku s reálným produktem na poličce — rádi ukážeme příklady na hovoru.',
      'For packaging we connect the brand with the real product on the shelf — happy to share examples on the call.',
    )

  if (items.length === 0)
    push(
      'Na úvodním hovoru projdeme, co potřebujete, a navrhneme další kroky.',
      'On the intro call we’ll walk through what you need and propose next steps.',
    )

  return items.map((i) => `<p style="margin:0 0 12px">${i}</p>`).join('')
}

// ── HTML šablona e-mailu pro leada ────────────────────────────────────────────
function leadEmailHtml(name: string, services: string[], lang: Lang): string {
  const t =
    lang === 'cs'
      ? {
          hi: `Ahoj ${esc(name)},`,
          intro:
            'díky za zprávu! Dostali jsme vaši poptávku a ozveme se vám do 1–2 pracovních dnů.',
          bookLead: 'Chcete to urychlit? Rezervujte si rovnou nezávazný úvodní hovor:',
          book: 'Rezervovat úvodní hovor',
          work: 'Mezitím se můžete podívat na naše práce',
          sign: 'Tým Slant',
          ps: 'Pokud jste tuto poptávku neodeslali, tento e-mail ignorujte.',
        }
      : {
          hi: `Hi ${esc(name)},`,
          intro:
            'thanks for reaching out! We’ve received your enquiry and will get back to you within 1–2 business days.',
          bookLead: 'Want to move faster? Book a no-obligation intro call right away:',
          book: 'Book an intro call',
          work: 'In the meantime, take a look at our work',
          sign: 'The Slant team',
          ps: 'If you didn’t send this enquiry, please ignore this email.',
        }

  const workUrl = lang === 'cs' ? 'https://slant.cz/work' : 'https://slant.cz/en/work'

  return `<!DOCTYPE html>
<html lang="${lang}">
<body style="margin:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="padding:40px 40px 8px">
          <div style="font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#1a1a1a">Slant</div>
        </td></tr>
        <tr><td style="padding:16px 40px 0">
          <p style="margin:0 0 16px;font-size:18px;font-weight:600">${t.hi}</p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6">${t.intro}</p>
          ${serviceBlock(services, lang)}
          <p style="margin:24px 0 12px;font-size:15px;line-height:1.6">${t.bookLead}</p>
          <p style="margin:0 0 28px">
            <a href="${esc(BOOKING_URL)}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:999px">${t.book}</a>
          </p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6">
            ${t.work}: <a href="${workUrl}" style="color:${BRAND}">${workUrl.replace('https://', '')}</a>
          </p>
          <p style="margin:0 0 4px;font-size:15px">${t.sign}</p>
        </td></tr>
        <tr><td style="padding:24px 40px 40px">
          <hr style="border:none;border-top:1px solid #eee;margin:0 0 16px">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#999">${t.ps}<br>Slant s.r.o. · Zborovská 940/2a, 616 00 Brno · <a href="https://slant.cz" style="color:#999">slant.cz</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── HTML interní notifikace ───────────────────────────────────────────────────
function internalEmailHtml(name: string, email: string, services: string[], message: string): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a">
    <h2 style="margin:0 0 16px">Nová poptávka z webu</h2>
    <p style="margin:0 0 6px"><strong>Jméno:</strong> ${esc(name)}</p>
    <p style="margin:0 0 6px"><strong>E-mail:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
    <p style="margin:0 0 6px"><strong>Služby:</strong> ${esc(services.join(', ') || '—')}</p>
    <p style="margin:16px 0 4px"><strong>Zpráva:</strong></p>
    <p style="margin:0;white-space:pre-wrap">${esc(message || '—')}</p>
  </div>`
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!RESEND_API_KEY) {
    return json({ success: false, message: 'Email service not configured.' }, 500)
  }

  let body: ContactPayload
  try {
    body = await request.json()
  } catch {
    return json({ success: false, message: 'Invalid request.' }, 400)
  }

  // Honeypot — boti zaškrtnou skryté pole
  if (body.botcheck) {
    return json({ success: true }) // tváříme se OK, ale nic neodešleme
  }

  // Časový trap — formulář odeslaný do 3 s je nejspíš bot
  if (typeof body.elapsedMs === 'number' && body.elapsedMs >= 0 && body.elapsedMs < 3000) {
    return json({ success: true }) // tiše ignoruj
  }

  // Cloudflare Turnstile
  const captchaOk = await verifyTurnstile(body.turnstileToken ?? '', clientAddress)
  if (!captchaOk) {
    return json({ success: false, message: 'Captcha verification failed.' }, 400)
  }

  const name = (body.name ?? '').toString().trim().slice(0, 120)
  const email = (body.email ?? '').toString().trim().slice(0, 200)
  const message = (body.message ?? '').toString().trim().slice(0, 5000)
  const lang: Lang = body.lang === 'en' ? 'en' : 'cs'
  const services = Array.isArray(body.services)
    ? body.services.map((s) => s.toString().slice(0, 60))
    : (body.services ?? '')
        .toString()
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

  if (!name) return json({ success: false, message: 'Name is required.' }, 400)
  if (!EMAIL_RE.test(email)) return json({ success: false, message: 'Valid email is required.' }, 400)

  // Příloha (volitelná) — base64 string přímo (Workers-safe, bez Buffer); limit kvůli body size
  let attachments: { filename: string; content: string }[] | undefined
  const att = body.attachment
  if (att?.data && att.filename) {
    if (att.data.length > MAX_ATTACH_BYTES * 1.4) {
      return json({ success: false, message: 'Attachment too large.' }, 413)
    }
    attachments = [{ filename: att.filename.slice(0, 200), content: att.data }]
  }

  const resend = new Resend(RESEND_API_KEY)

  try {
    // 1) Interní notifikace
    await resend.emails.send({
      from: RESEND_FROM,
      to: CONTACT_TO,
      replyTo: email,
      subject: `Nová poptávka — ${name}`,
      html: internalEmailHtml(name, email, services, message),
      ...(attachments && { attachments }),
    })

    // 2) Personalizovaný e-mail leadovi
    await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      subject: lang === 'cs' ? 'Díky za vaši zprávu — Slant' : 'Thanks for reaching out — Slant',
      html: leadEmailHtml(name, services, lang),
    })

    return json({ success: true })
  } catch (err) {
    console.error('[api/contact] Resend error:', err)
    return json({ success: false, message: 'Failed to send.' }, 502)
  }
}
