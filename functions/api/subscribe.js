// Cloudflare Pages Function — /api/subscribe
// Adds an email to the Kit (ConvertKit) form. The key stays on the server.
// Cloudflare Dashboard > Workers & Pages > your project > Settings > Variables:
//   KIT_API_KEY = your Kit API key
//   KIT_FORM_ID = your Kit form id (numeric)

const ALLOWED_ORIGINS = ['https://pdfmaspro.com', 'https://www.pdfmaspro.com']

// Best-effort rate limit (per isolate instance).
const hits = new Map()
function rateLimited(ip, max = 10, windowMs = 10 * 60 * 1000) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter(t => now - t < windowMs)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > max
}

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

  // Honeypot: real users never fill this hidden field.
  if (body.website) return json({ success: true }, 200, corsHeaders)

  const ip = request.headers.get('cf-connecting-ip') ||
             request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) return json({ error: 'Too many attempts. Please try again later.' }, 429, corsHeaders)

  const email = String(body.email || '').trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please enter a valid email address' }, 400, corsHeaders)
  }

  const KEY = env.KIT_API_KEY
  const FORM = env.KIT_FORM_ID
  if (!KEY || !FORM) return json({ error: 'Newsletter is not configured yet' }, 500, corsHeaders)

  try {
    let r
    if (KEY.startsWith('kit_')) {
      // Kit v4 API key
      r = await fetch(`https://api.kit.com/v4/forms/${FORM}/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': KEY },
        body: JSON.stringify({ email_address: email }),
      })
    } else {
      // Kit v3 API key
      r = await fetch(`https://api.convertkit.com/v3/forms/${FORM}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: KEY, email }),
      })
    }

    if (r.ok) return json({ success: true }, 200, corsHeaders)

    const data = await r.json().catch(() => ({}))
    console.error('Kit error', r.status, data)
    return json({ error: 'Could not subscribe right now. Please try again later.' }, 502, corsHeaders)
  } catch (err) {
    console.error('Subscribe error', err)
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
