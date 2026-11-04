import type { APIRoute } from 'astro'

// On-demand (serverless) — nesmí se prerenderovat staticky
export const prerender = false

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY ?? ''
// Odesílatel — musí být na ověřené doméně v Resend (např. "Slant <petr@slant.cz>")
const RESEND_FROM = import.meta.env.RESEND_FROM ?? 'Slant <petr@slant.cz>'
// Interní příjemce notifikací o nových poptávkách
const CONTACT_TO = import.meta.env.CONTACT_TO ?? 'petr@slant.cz'
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

// ── HTML šablona potvrzení pro odesílatele ──────────────────────────────────
// Potvrzení „zpráva došla" + rekapitulace toho, co odeslal. Obrázky jen PNG
// (Gmail/Outlook neumí SVG), styly inline, layout tabulkami.
const LOGO_URL = 'https://slant.cz/email/slant-logo.png'

interface LeadSummary {
  name: string
  email: string
  services: string[]
  message: string
  attachmentName?: string
}

function leadEmailHtml(d: LeadSummary, lang: Lang): string {
  const t =
    lang === 'cs'
      ? {
          title: 'Vaše zpráva dorazila',
          hi: `Dobrý den, ${esc(d.name)},`,
          intro:
            'děkujeme, že jste nám napsali. Vaši zprávu máme a ozveme se vám zpravidla do 3 dnů.',
          recap: 'Co jste nám poslali',
          lName: 'Jméno',
          lEmail: 'E-mail',
          lServices: 'Služby',
          lMessage: 'Zpráva',
          lAttach: 'Příloha',
          bookLead: 'Chcete to urychlit? Rovnou si rezervujte nezávazný úvodní hovor.',
          book: 'Rezervovat úvodní hovor',
          reply: 'Chcete něco doplnit? Stačí odpovědět na tento e-mail.',
          sign: 'Těšíme se,<br>tým Slant',
          ps: 'Tento e-mail jsme poslali, protože někdo vyplnil kontaktní formulář na slant.cz s vaší adresou. Pokud jste to nebyli vy, e-mail ignorujte.',
        }
      : {
          title: 'Your message has arrived',
          hi: `Hi ${esc(d.name)},`,
          intro:
            'thank you for getting in touch. We have your message and will usually get back to you within 3 days.',
          recap: 'What you sent us',
          lName: 'Name',
          lEmail: 'Email',
          lServices: 'Services',
          lMessage: 'Message',
          lAttach: 'Attachment',
          bookLead: 'Want to move faster? Book a no-obligation intro call right away.',
          book: 'Book an intro call',
          reply: 'Want to add something? Just reply to this email.',
          sign: 'Looking forward to it,<br>the Slant team',
          ps: 'You received this email because someone filled in the contact form on slant.cz with your address. If it wasn’t you, please ignore it.',
        }

  const row = (label: string, value: string) => `
              <tr>
                <td style="padding:10px 0;border-top:1px solid #ececec;font-size:13px;color:#8a8a8a;width:96px;vertical-align:top">${label}</td>
                <td style="padding:10px 0;border-top:1px solid #ececec;font-size:14px;line-height:1.55;color:#1a1a1a;vertical-align:top">${value}</td>
              </tr>`

  const rows = [
    row(t.lName, esc(d.name)),
    row(t.lEmail, esc(d.email)),
    d.services.length ? row(t.lServices, esc(d.services.join(', '))) : '',
    d.message
      ? row(t.lMessage, `<span style="white-space:pre-wrap">${esc(d.message)}</span>`)
      : '',
    d.attachmentName ? row(t.lAttach, esc(d.attachmentName)) : '',
  ].join('')

  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${t.title}</title></head>
<body style="margin:0;padding:0;background:#f4f3f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a">
  <div style="display:none;max-height:0;overflow:hidden">${t.intro}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f1;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px">
        <tr><td style="padding:36px 40px 0">
          <a href="https://slant.cz" style="text-decoration:none"><img src="${LOGO_URL}" width="96" height="30" alt="Slant" style="display:block;border:0;width:96px;height:30px"></a>
        </td></tr>
        <tr><td style="padding:36px 40px 0">
          <h1 style="margin:0 0 20px;font-size:26px;line-height:1.2;font-weight:700;letter-spacing:-0.02em">${t.title}</h1>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6">${t.hi}</p>
          <p style="margin:0;font-size:15px;line-height:1.6">${t.intro}</p>
        </td></tr>
        <tr><td style="padding:28px 40px 0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f5;border-radius:12px">
            <tr><td style="padding:20px 22px 10px">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8a8a8a">${t.recap}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
              </table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:28px 40px 0">
          <p style="margin:0 0 14px;font-size:15px;line-height:1.6">${t.bookLead}</p>
          <a href="${esc(BOOKING_URL)}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 26px;border-radius:999px">${t.book}</a>
        </td></tr>
        <tr><td style="padding:28px 40px 36px">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6">${t.reply}</p>
          <p style="margin:0;font-size:15px;line-height:1.6">${t.sign}</p>
        </td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
        <tr><td style="padding:20px 40px 0">
          <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#9a9a9a">${t.ps}</p>
          <p style="margin:0;font-size:12px;line-height:1.5;color:#9a9a9a">Slant s.r.o. · Zborovská 940/2a, 616 00 Brno · <a href="https://slant.cz" style="color:#9a9a9a">slant.cz</a></p>
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

  // Přímé volání Resend HTTP API přes fetch — Workers-native (bez SDK)
  async function sendEmail(payload: Record<string, unknown>) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      throw new Error(`Resend ${r.status}: ${detail}`)
    }
    return r.json()
  }

  try {
    // 1) Interní notifikace
    await sendEmail({
      from: RESEND_FROM,
      to: CONTACT_TO,
      reply_to: email,
      subject: `Nová poptávka — ${name}`,
      html: internalEmailHtml(name, email, services, message),
      ...(attachments && { attachments }),
    })

    // 2) Personalizovaný e-mail leadovi
    await sendEmail({
      from: RESEND_FROM,
      to: email,
      reply_to: CONTACT_TO, // odpověď klienta jde rovnou nám
      subject: lang === 'cs' ? 'Vaše zpráva dorazila — Slant' : 'Your message has arrived — Slant',
      html: leadEmailHtml(
        { name, email, services, message, attachmentName: attachments?.[0]?.filename },
        lang,
      ),
    })

    return json({ success: true })
  } catch (err) {
    console.error('[api/contact] Resend error:', err)
    return json({ success: false, message: 'Failed to send.' }, 502)
  }
}
