import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

function Alternative() {
  const tools = [
    { name: 'Merge PDF', path: '/merge', icon: '🔗' },
    { name: 'Compress PDF', path: '/compress', icon: '🗜️' },
    { name: 'Split PDF', path: '/split', icon: '✂️' },
    { name: 'PDF to JPG', path: '/pdf-to-jpg', icon: '🖼️' },
    { name: 'Bank Converter', path: '/bank-converter', icon: '🏦' },
  ]

  const comparison = [
    { feature: 'File Size Limit',            ours: 'None ✅',       others: 'Limited ❌' },
    { feature: 'Login Required',             ours: 'Never ✅',      others: 'Often required ❌' },
    { feature: 'Daily Usage Limit',          ours: 'None ✅',       others: 'Yes (free plan) ❌' },
    { feature: 'Files Uploaded to Server',   ours: 'Never ✅',      others: 'Yes ❌' },
    { feature: 'Ads',                        ours: 'Minimal ✅',    others: 'Heavy ❌' },
    { feature: 'Price',                      ours: '100% Free ✅',  others: 'Freemium ❌' },
    { feature: 'Bank Statement Converter',   ours: 'Yes ✅',        others: 'No ❌' },
    { feature: 'Hindi Language Support',     ours: 'Yes ✅',        others: 'No ❌' },
  ]

  const painPoints = [
    '"Your file exceeds the size limit"',
    '"You\'ve reached your daily limit"',
    '"Please sign in to continue"',
    '"Upgrade to Premium for this feature"',
    '"Your files are uploaded to our servers"',
    '"Processing is slow during peak hours"',
  ]

  return (
    <>
      <Helmet>
        <title>Free PDF Tools Online — No File Size Limits, No Login | PDF Master Pro</title>
        <meta name="description" content="Tired of PDF tools with file size limits, daily caps, and forced logins? PDF Master Pro gives you 32 free PDF tools with zero restrictions — no login, no limits, 100% private." />
        <meta name="keywords" content="free pdf tools no limits, pdf tools without login, unlimited pdf tools online, pdf tools 100% free, best free pdf tools" />
        <meta property="og:title" content="Free PDF Tools — No Limits, No Login | PDF Master Pro" />
        <meta property="og:description" content="32 free PDF tools. No file size limits. No login. Files never leave your browser." />
        <link rel="canonical" href="https://pdfmaspro.com/why-choose-us" />
      </Helmet>

      <div className="container mx-auto px-4 py-16 max-w-5xl">

        {/* Hero */}
        <div className="text-center mb-16">
          <span className="text-xs bg-indigo-900/50 text-indigo-300 px-3 py-1 rounded-full mb-4 inline-block">
            🚀 Why PDF Master Pro?
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Free PDF Tools with Zero Restrictions
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Most online PDF tools come with hidden limits — file size caps, daily quotas, forced logins. We built PDF Master Pro to remove all of that. 32 tools, forever free, zero restrictions.
          </p>
          <Link to="/" className="btn-primary text-lg px-8 py-3">
            Try Free Tools Now →
          </Link>
        </div>

        {/* Pain points */}
        <div className="mb-16 p-6 bg-red-900/20 border border-red-800 rounded-2xl">
          <h2 className="text-xl font-bold mb-4 text-red-400">😤 Tired of seeing these messages?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {painPoints.map((pain, i) => (
              <div key={i} className="flex items-center gap-2 text-red-300 text-sm">
                <span>❌</span> <span>{pain}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-300 mt-4 text-sm">
            <strong className="text-white">PDF Master Pro eliminates all of these.</strong> Zero limits. Zero login. Zero uploads.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">PDF Master Pro vs Typical Online PDF Tools</h2>
          <div className="border border-gray-700 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/80">
                  <th className="px-4 py-3 text-left text-gray-300">Feature</th>
                  <th className="px-4 py-3 text-center text-indigo-300">PDF Master Pro</th>
                  <th className="px-4 py-3 text-center text-gray-400">Other Tools</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-900/40' : 'bg-gray-900/20'}>
                    <td className="px-4 py-3 text-sm text-gray-300">{row.feature}</td>
                    <td className="px-4 py-3 text-center text-sm text-green-400 font-semibold">{row.ours}</td>
                    <td className="px-4 py-3 text-center text-sm text-red-400">{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Why we're different */}
        <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '♾️', title: 'Truly Unlimited', desc: 'No file size caps. No daily processing limits. Use as much as you need, as many times as you want.' },
            { icon: '🔒', title: '100% Private', desc: 'Unlike most PDF tools that upload your files to their servers, we process everything locally in your browser. Your files never leave your device.' },
            { icon: '🚀', title: 'No Sign-Up Ever', desc: 'No account needed. No email. No credit card. Just open the tool and start working — instantly.' },
          ].map((item, i) => (
            <div key={i} className="card text-center">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Privacy deep dive */}
        <div className="mb-16 p-6 bg-green-900/20 border border-green-800 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-6xl">🛡️</div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Files Never Leave Your Device</h2>
              <p className="text-gray-300 mb-3">
                Most online PDF tools send your files to a remote server for processing. That means your confidential documents — bank statements, legal papers, personal IDs — are uploaded to someone else's computer.
              </p>
              <p className="text-gray-300 mb-3">
                PDF Master Pro works entirely inside your browser using JavaScript. <strong className="text-white">We literally cannot see your files</strong> — there's no server involved.
              </p>
              <div className="flex flex-wrap gap-3">
                {['✅ No server uploads', '✅ No file storage', '✅ No tracking', '✅ Works offline after load'].map(p => (
                  <span key={p} className="text-xs bg-green-900/30 border border-green-800 text-green-300 px-2 py-1 rounded-full">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Featured tools */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">32 Free Tools — All Unlimited</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tools.map(tool => (
              <Link to={tool.path} key={tool.path}
                className="card group hover:border-indigo-500 text-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{tool.icon}</div>
                <p className="font-semibold text-sm">{tool.name}</p>
                <p className="text-indigo-400 text-xs mt-1">Use Free →</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/" className="btn-secondary px-6 py-2">View All 32 Tools →</Link>
          </div>
        </div>

        {/* CTA */}
        <div className="card bg-gradient-to-r from-indigo-900/40 to-purple-900/40 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to use PDF tools without limits?</h2>
          <p className="text-gray-300 mb-4">No sign-up. No restrictions. Just free, private, instant PDF processing.</p>
          <Link to="/" className="btn-primary px-8 py-3 text-lg">Start Now — It's Free →</Link>
        </div>

      </div>
    </>
  )
}

export default Alternative
