import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'

// Newsletter — subscribers are added to Kit through the /api/subscribe serverless function.

const PAST_ISSUES = [
  { no: 3, title: 'How to Compress PDFs Without Losing Quality', date: 'May 2025', preview: 'Learn the difference between lossy and lossless compression and when to use each.' },
  { no: 2, title: 'Bank Statement to Excel — Step by Step Guide', date: 'Apr 2025', preview: 'A complete walkthrough of converting SBI, HDFC, and ICICI bank PDFs to Excel.' },
  { no: 1, title: '5 PDF Tricks Every Indian Professional Should Know', date: 'Mar 2025', preview: 'From GST invoices to Aadhaar PDFs — here are the tools that save you hours every month.' },
]

const PERKS = [
  { icon: '🛠️', title: 'New Tool Alerts',       desc: 'Be first to know when we launch new tools' },
  { icon: '📖', title: 'PDF Tips & Tricks',     desc: 'Practical tutorials every month, free' },
  { icon: '🇮🇳', title: 'India-Specific Guides', desc: 'GST, ITR, bank statements — things that matter to you' },
  { icon: '🚫', title: 'No Spam, Ever',          desc: 'Max 1–2 emails per month, unsubscribe anytime' },
]

function Newsletter() {
  const [email, setEmail]         = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [hp, setHp]               = useState('')

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website: hp }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
      setSubmitted(true)

    } catch (err) {
      setError('Could not subscribe right now. Please try again or email support@pdfmaspro.com')
      console.error('Subscribe error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Newsletter — Free PDF Tips for India | PDF Master Pro</title>
        <meta name="description" content="Monthly newsletter with practical PDF guides, India-specific tips — GST, ITR, bank statements. Free forever. Join PDF Master Pro newsletter." />
        <link rel="canonical" href="https://pdfmaspro.com/newsletter" />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-3xl">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">📬</div>
          <h1 className="text-4xl font-bold mb-3">PDF Master Pro Newsletter</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Monthly newsletter with practical PDF guides, new tool announcements,
            and India-specific tricks. Free forever.
          </p>
        </div>

        {/* Perks grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {PERKS.map(p => (
            <div key={p.title} className="flex items-start gap-4 p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <h3 className="font-semibold text-white">{p.title}</h3>
                <p className="text-gray-400 text-sm mt-0.5">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Subscribe box */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-700/50 rounded-2xl p-8 mb-12">
          {submitted ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">You're subscribed!</h2>
              <p className="text-gray-300">Welcome to the PDF Master Pro newsletter.</p>
              <p className="text-gray-400 text-sm mt-2">
                First issue arrives next month. Check spam folder if you don't see it.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1">Subscribe — It's Free</h2>
              <p className="text-gray-400 text-sm mb-5">
                Join readers getting monthly PDF tips. No spam. Unsubscribe anytime.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="you@example.com"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-sm text-white"
                  required />
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  value={hp} onChange={e => setHp(e.target.value)}
                  style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} />
                <button type="submit" disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-all">
                  {loading ? '⏳ Subscribing...' : '📬 Subscribe Free'}
                </button>
              </form>
              {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
              <p className="text-xs text-gray-500 mt-3">
                ✅ No spam · Max 2 emails/month · Unsubscribe anytime · Powered by Kit
              </p>
            </>
          )}
        </div>

        {/* Past issues */}
        <div>
          <h2 className="text-xl font-bold mb-6">Past Issues</h2>
          <div className="space-y-4">
            {PAST_ISSUES.map(issue => (
              <div key={issue.no}
                className="p-5 bg-gray-800/50 border border-gray-700 hover:border-indigo-500/50 rounded-xl transition-all">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs text-indigo-400 font-semibold">
                      Issue #{issue.no} · {issue.date}
                    </span>
                    <h3 className="font-semibold mt-1 text-white">{issue.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{issue.preview}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}

export default Newsletter
