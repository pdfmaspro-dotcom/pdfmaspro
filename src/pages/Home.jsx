import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import TrustBadges from '../components/TrustBadges'
import ToolIcon from '../components/ToolIcon'
import { getTranslation } from '../data/translations'

// Category header icons — clean SVG, no emoji
const CategoryIcon = ({ type }) => {
  const icons = {
    organize: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 7h18M3 12h18M3 17h18"/></svg>,
    convert:  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v7H4zM4 13h16v7H4z"/></svg>,
    optimize: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    utility:  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    security: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  }
  return icons[type] || null
}

const categoryAccent = {
  organize: 'text-blue-400 bg-blue-900/30',
  convert:  'text-indigo-400 bg-indigo-900/30',
  optimize: 'text-orange-400 bg-orange-900/30',
  utility:  'text-teal-400 bg-teal-900/30',
  security: 'text-red-400 bg-red-900/30',
}

function Home({ tools, toolCount, onSupportClick, lang = 'en' }) {
  const t = (key) => getTranslation(lang, key)
  const count = toolCount || tools.length

  const categories = {
    organize: { title: t('organize'), type: 'organize', tools: tools.filter(t => t.category === 'organize') },
    convert:  { title: t('convert'),  type: 'convert',  tools: tools.filter(t => t.category === 'convert') },
    optimize: { title: t('optimize'), type: 'optimize', tools: tools.filter(t => t.category === 'optimize') },
    utility:  { title: t('utility'),  type: 'utility',  tools: tools.filter(t => t.category === 'utility') },
    security: { title: t('security'), type: 'security', tools: tools.filter(t => t.category === 'security') },
  }

  const featureIcons = {
    noLimit:   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"/></svg>,
    noLogin:   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>,
    private:   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    browser:   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><circle cx="12" cy="10" r="2"/></svg>,
  }

  return (
    <>
      <Helmet>
        <title>Free PDF Tools Online — No Limits, No Login | PDF Master Pro</title>
        <meta name="description" content={`${count} free PDF tools online. Merge, split, compress, convert, unlock PDFs. No file size limits, no login required, 100% private. All processing in your browser.`} />
        <link rel="canonical" href="https://pdfmaspro.com/" />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
        <div className="container mx-auto px-4 text-center relative">
          <Link to="/why-choose-us"
            className="inline-flex items-center gap-2 bg-indigo-900/40 border border-indigo-700 text-indigo-300 px-4 py-1.5 rounded-full text-sm mb-6 hover:bg-indigo-900/60 transition-all">
            ✨ Zero restrictions — No file size limits, no daily caps
          </Link>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t('hero_title')}
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('hero_subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a href="#tools" className="btn-primary text-lg px-8 py-3">{t('start_now')}</a>
            <button onClick={onSupportClick} className="btn-secondary text-lg px-8 py-3">❤️ {t('support_kofi')}</button>
          </div>
          <div className="inline-flex items-center gap-2 bg-green-900/20 border border-green-800 text-green-300 px-4 py-2 rounded-full text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Your files never leave your browser — 100% private, always
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 pb-8">
        <TrustBadges />
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { icon: featureIcons.noLimit, color: 'text-indigo-400', title: t('no_file_limits'), desc: t('no_file_limits_desc') },
            { icon: featureIcons.noLogin, color: 'text-purple-400', title: t('no_login'),       desc: t('no_login_desc') },
            { icon: featureIcons.private, color: 'text-green-400',  title: t('private'),        desc: t('private_desc') },
            { icon: featureIcons.browser, color: 'text-orange-400', title: t('works_browser'),  desc: t('works_browser_desc') },
          ].map((f, i) => (
            <div key={i} className="card text-center">
              <div className={`flex justify-center mb-3 ${f.color}`}>{f.icon}</div>
              <h3 className="font-bold">{f.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tools Grid — all categories, all tools */}
      <section id="tools" className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold">{count} Free PDF Tools</h2>
          <span className="text-sm text-gray-500 hidden sm:block">No login · No limits · 100% free</span>
        </div>

        {Object.entries(categories).map(([key, category]) => (
          category.tools.length === 0 ? null :
          <div key={key} className="mb-14">
            {/* Category header */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${categoryAccent[key]}`}>
                <CategoryIcon type={key} />
              </div>
              <h3 className="text-xl font-bold">{category.title}</h3>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                {category.tools.length} tools
              </span>
            </div>

            {/* Tool cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {category.tools.map(tool => (
                <Link to={tool.path} key={tool.id}
                  className="card group hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all flex items-start gap-4 p-5">
                  <div className="flex-shrink-0 mt-0.5">
                    <ToolIcon toolId={tool.id} category={tool.category} size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm mb-1 group-hover:text-indigo-300 transition-colors">{tool.name}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{tool.description}</p>
                    <p className="text-indigo-400 text-xs mt-2 font-medium group-hover:text-indigo-300">
                      Use free →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Privacy Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="card bg-gradient-to-r from-green-900/20 to-teal-900/20 border-green-800/50">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-green-400 flex-shrink-0">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Privacy is Our #1 Priority</h2>
              <p className="text-gray-300 mb-3">
                Most online PDF tools upload your files to remote servers. PDF Master Pro works differently —
                everything runs locally inside your browser. <strong className="text-white">Your files never leave your device.</strong>
              </p>
              <div className="flex flex-wrap gap-3">
                {['No server uploads', 'No file storage', 'No tracking', 'Works offline after load'].map(p => (
                  <span key={p} className="text-xs bg-green-900/30 border border-green-800 text-green-300 px-2 py-1 rounded-full">✓ {p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* India-specific highlight */}
      <section className="container mx-auto px-4 py-8">
        <div className="card bg-gradient-to-r from-orange-900/20 to-amber-900/20 border-orange-800/50">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-orange-400 flex-shrink-0 text-5xl">🇮🇳</div>
            <div>
              <h2 className="text-xl font-bold mb-2">Made for India — Unique Tools You Won't Find Elsewhere</h2>
              <p className="text-gray-300 text-sm mb-3">
                We built India-specific tools that other free PDF tools don't offer.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Bank Statement Converter', path: '/bank-converter', desc: 'SBI, HDFC, ICICI, Axis, Kotak' },
                  { name: 'GST Invoice Reader', path: '/gst-invoice', desc: 'Extract GSTIN & amounts' },
                ].map(tool => (
                  <Link key={tool.path} to={tool.path}
                    className="text-xs bg-orange-900/30 border border-orange-800 text-orange-300 px-3 py-1.5 rounded-lg hover:bg-orange-900/50 transition-colors">
                    {tool.name} <span className="text-orange-500">— {tool.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="container mx-auto px-4 py-12">
        <div className="card bg-gradient-to-r from-indigo-900/40 to-purple-900/40 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('support_title')}</h2>
          <p className="text-gray-300 mb-6">{t('support_desc')}</p>
          <button onClick={onSupportClick}
            className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all">
            ❤️ {t('buy_coffee')}
          </button>
        </div>
      </section>
    </>
  )
}

export default Home
