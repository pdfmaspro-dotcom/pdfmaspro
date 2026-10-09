// Cloudflare Pages Function — /api/contact
// Delivers contact-form messages to support@pdfmaspro.com via Resend.
// Cloudflare Dashboard > Workers & Pages > your project > Settings > Variables:
//   RESEND_API_KEY = your Resend API key

const ALLOWED_ORIGINS = ['https://pdfmaspro.com', 'https://www.pdfmaspro.com']

// Best-effort rate limit (per isolate instance).
const hits = new Map()
function rateLimited(ip, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter(t => now - t < windowMs)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > max
}

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const oneLine = (s) => String(s).replace(/[\r\n]+/g, ' ').trim()

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('origin') || ''
  const originOk = !origin || ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost')

  const corsHeaders = {
    'Access-Control-Allow-Origin': originOk && origin ? origin : '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }

  if (!originOk) return json({ error: 'Forbidden' }, 403, corsHeaders)

  let body = {}
  try { body = await request.json() } catch { return json({ error: 'Invalid JSON' }, 400, corsHeaders) }

  // Honeypot: real users never fill this hidden field. Pretend success so bots move on.
  if (body.website) return json({ success: true }, 200, corsHeaders)

  const ip = request.headers.get('cf-connecting-ip') ||
             request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) return json({ error: 'Too many messages. Please try again later.' }, 429, corsHeaders)

  const name = oneLine(body.name || '')
  const email = oneLine(body.email || '')
  const subject = oneLine(body.subject || '') || 'General Inquiry'
  const message = String(body.message || '').trim()

  if (!name || !email || !message) return json({ error: 'Name, email and message are required' }, 400, corsHeaders)
  if (name.length > 100 || subject.length > 100 || email.length > 200) return json({ error: 'Input too long' }, 400, corsHeaders)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Please enter a valid email address' }, 400, corsHeaders)
  if (message.length < 5 || message.length > 5000) return json({ error: 'Message must be between 5 and 5000 characters' }, 400, corsHeaders)

  const RESEND_API_KEY = env.RESEND_API_KEY
  if (!RESEND_API_KEY) return json({ error: 'Email service not configured' }, 500, corsHeaders)

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'PDF Master Pro Contact Form <noreply@pdfmaspro.com>',
        to: ['support@pdfmaspro.com'],
        reply_to: email,
        subject: `[PDF Master Pro] ${subject} — from ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:8px;">
            <div style="background:#6366f1;padding:16px 24px;border-radius:6px 6px 0 0;">
              <h2 style="color:white;margin:0;font-size:18px;">New Contact Form Submission</h2>
              <p style="color:#c7d2fe;margin:4px 0 0;font-size:13px;">pdfmaspro.com</p>
            </div>
            <div style="background:white;padding:24px;border-radius:0 0 6px 6px;border:1px solid #e5e7eb;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:80px;font-weight:600;">Name</td><td style="padding:8px 0;color:#111827;font-size:14px;">${esc(name)}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;font-weight:600;">Email</td><td style="padding:8px 0;"><a href="mailto:${esc(email)}" style="color:#6366f1;">${esc(email)}</a></td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;font-weight:600;">Subject</td><td style="padding:8px 0;color:#111827;font-size:14px;">${esc(subject)}</td></tr>
              </table>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;"/>
              <p style="color:#6b7280;font-size:13px;font-weight:600;margin:0 0 8px;">Message</p>
              <div style="background:#f3f4f6;padding:16px;border-radius:6px;color:#374151;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(message)}</div>
              <div style="margin-top:20px;text-align:center;">
                <a href="mailto:${esc(email)}?subject=${encodeURIComponent('Re: ' + subject)}" style="background:#6366f1;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">Reply to ${esc(name)}</a>
              </div>
            </div>
          </div>`,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      console.error('Resend error:', data)
      return json({ error: 'Could not send your message right now. Please email support@pdfmaspro.com.' }, 502, corsHeaders)
    }
    return json({ success: true }, 200, corsHeaders)
  } catch (err) {
    console.error('Server error:', err)
    return json({ error: 'Server error. Please try again.' }, 500, corsHeaders)
  }
}

export async function onRequestOptions({ request }) {
  const origin = request.headers.get('origin') || ''
  const originOk = !origin || ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost')
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': originOk && origin ? origin : '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    },
  })
}
