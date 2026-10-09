import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'

// Contact form — Resend se deliver hota hai support@pdfmaspro.com par
// Cloudflare Pages Function: /functions/api/contact.js handle karta hai
// Setup: Cloudflare Dashboard > Workers & Pages > project > Settings > Environment Variables > RESEND_API_KEY

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', website: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errMsg, setErrMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setErrMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '', website: '' })

    } catch (err) {
      setErrMsg(err.message || 'Network error. Please try again.')
      setStatus('error')
    }
  }

  const field = 'w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-sm text-white placeholder-gray-500'

  return (
    <>
      <Helmet>
        <title>Contact Us | PDF Master Pro</title>
        <meta name="description" content="Contact PDF Master Pro for support, feedback, or questions. We respond within 48 hours." />
        <link rel="canonical" href="https://pdfmaspro.com/contact" />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
        <p className="text-gray-400 mb-1">Have questions or suggestions? We'd love to hear from you.</p>
        <p className="text-gray-400 text-sm mb-8">
          Or email directly:{' '}
          <a href="mailto:support@pdfmaspro.com" className="text-indigo-400 hover:underline font-medium">
            support@pdfmaspro.com
          </a>
        </p>

        {/* Success */}
        {status === 'success' && (
          <div className="mb-6 p-6 bg-green-900/30 border border-green-700 rounded-xl text-center">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="text-green-400 font-bold text-xl mb-2">Message Sent!</h3>
            <p className="text-green-300 text-sm">We'll get back to you at <strong>{formData.email || 'your email'}</strong> within 48 hours.</p>
            <button onClick={() => setStatus('idle')} className="mt-5 px-4 py-2 border border-green-600 text-green-400 rounded-lg text-sm hover:bg-green-900/30">
              Send Another Message
            </button>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="mb-5 p-4 bg-red-900/30 border border-red-700 rounded-xl flex items-start gap-3">
            <span className="text-xl">❌</span>
            <div>
              <p className="text-red-400 text-sm font-medium">{errMsg}</p>
              <p className="text-red-400/70 text-xs mt-1">
                Ya seedha email karo:{' '}
                <a href="mailto:support@pdfmaspro.com" className="underline">support@pdfmaspro.com</a>
              </p>
              <button onClick={() => setStatus('idle')} className="mt-2 text-xs text-red-300 underline">Try Again</button>
            </div>
          </div>
        )}

        {/* Form */}
        {status !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Name <span className="text-red-400">*</span>
                </label>
                <input type="text" required placeholder="Your name"
                  className={field} value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Email <span className="text-red-400">*</span>
                </label>
                <input type="email" required placeholder="your@email.com"
                  className={field} value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Subject</label>
              <select className={field} value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}>
                <option value="">Select a topic...</option>
                <option value="Bug Report">🐛 Bug Report</option>
                <option value="Feature Request">💡 Feature Request</option>
                <option value="Tool Not Working">🔧 Tool Not Working</option>
                <option value="General Question">❓ General Question</option>
                <option value="Feedback">⭐ Feedback</option>
                <option value="Other">📝 Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea rows={5} required placeholder="Describe your question or issue in detail..."
                className={`${field} resize-none`} value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })} />
              <p className="text-xs text-gray-600 mt-1">{formData.message.length} characters</p>
            </div>

            {/* Honeypot spam protection */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
              value={formData.website}
              onChange={e => setFormData({ ...formData, website: e.target.value })}
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} />

            <button type="submit" disabled={status === 'sending'}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
              {status === 'sending'
                ? <><span className="animate-spin">⏳</span> Sending...</>
                : '📨 Send Message'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Delivered to support@pdfmaspro.com
            </p>
          </form>
        )}

        {/* Info cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
            <h3 className="font-semibold mb-3">⚡ Quick Answers</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>→ Files processed in browser only</li>
              <li>→ No file size limits</li>
              <li>→ No login required</li>
              <li>→ All 32 tools are 100% free</li>
            </ul>
          </div>
          <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
            <h3 className="font-semibold mb-3">🕐 Response Time</h3>
            <p className="text-gray-400 text-sm mb-3">We respond within 24–48 hours on working days.</p>
            <a href="mailto:support@pdfmaspro.com" className="text-indigo-400 text-sm hover:underline">
              📧 support@pdfmaspro.com
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Contact
