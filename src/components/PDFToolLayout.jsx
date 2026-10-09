import React from 'react'
import ToolIcon from './ToolIcon'
import { Helmet } from 'react-helmet-async'
import { WebAppSchema, BreadcrumbSchema } from './SchemaMarkup'
import FAQ from './FAQ'
import HowToUse from './HowToUse'
import WhyUse from './WhyUse'
import { toolFAQs, defaultFAQs } from '../data/toolFAQs'
import seoMeta from '../data/seoMeta'
import AdSlot from './AdSlot'
import toolDefinitions from '../data/toolDefinitions'
import { FAQSchema } from './SchemaMarkup'

const howToSteps = {
  default: [
    { title: 'Upload Your PDF', desc: 'Drag & drop your file or click to browse. Any size accepted.' },
    { title: 'Process Instantly', desc: 'Our tool processes your file entirely in your browser — no upload needed.' },
    { title: 'Download Result', desc: 'Click download to save your processed file. Done in seconds!' },
  ],
  '/merge': [
    { title: 'Select Multiple PDFs', desc: 'Choose 2 or more PDF files to combine.' },
    { title: 'Click Merge', desc: 'We combine all pages in the order you selected.' },
    { title: 'Download Merged PDF', desc: 'Your combined PDF is ready instantly.' },
  ],
  '/compress': [
    { title: 'Upload Your PDF', desc: 'Select the PDF you want to compress.' },
    { title: 'Choose Quality Level', desc: 'Pick Low, Medium, or High compression based on your needs.' },
    { title: 'Download Compressed PDF', desc: 'See the size reduction and download your smaller PDF.' },
  ],
  '/bank-converter': [
    { title: 'Upload Bank Statement', desc: 'Upload your PDF bank statement downloaded from net banking.' },
    { title: 'Review Transactions', desc: 'All transactions extracted and shown in a table. Filter and search.' },
    { title: 'Download CSV or Excel', desc: 'Export your transactions as CSV or Excel for analysis.' },
  ],
  '/gst-invoice': [
    { title: 'Upload GST Invoice PDF', desc: 'Upload any GST invoice from Amazon, Flipkart, or any Indian seller.' },
    { title: 'Review Extracted Data', desc: 'GSTIN, invoice number, CGST, SGST, and total are auto-extracted.' },
    { title: 'Copy or Download', desc: 'Copy the data or download as CSV for your records.' },
  ],
  '/ocr-pdf': [
    { title: 'Upload Scanned PDF', desc: 'Upload your scanned or image-based PDF.' },
    { title: 'Select Language', desc: 'Choose English, Hindi, or other language for best accuracy.' },
    { title: 'Download Text', desc: 'Copy extracted text or download as .txt file.' },
  ],
}

function PDFToolLayout({ tool, children }) {
  const path = tool.path.replace('/', '')
  const meta = seoMeta[path] || {
    title: `${tool.name} Online Free | PDF Master Pro`,
    description: `${tool.description} — Free online tool with no file size limits, no login required, 100% private.`,
    keywords: `${tool.name.toLowerCase()}, free online pdf, pdf tools india`
  }
  const lastUpdated = meta.lastUpdated || '2026-10-08'
  const definition = toolDefinitions[tool.path]

  const faqs = toolFAQs[tool.path]
    ? [...toolFAQs[tool.path], ...defaultFAQs.slice(0, 2)]
    : defaultFAQs

  const steps = howToSteps[tool.path] || howToSteps.default

  // ✅ HowTo Schema — Google pe steps carousel dikhega
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${tool.name} — Free Online`,
    "description": meta.description,
    "tool": {
      "@type": "HowToTool",
      "name": "PDF Master Pro",
      "url": "https://pdfmaspro.com"
    },
    "step": steps.map((step, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": step.title,
      "text": step.desc,
      "url": `https://pdfmaspro.com${tool.path}`
    }))
  }

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="keywords" content={meta.keywords} />
        {/* Open Graph */}
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://pdfmaspro.com${tool.path}`} />
        <meta property="og:image" content="https://pdfmaspro.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="PDF Master Pro" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content="https://pdfmaspro.com/og-image.png" />
        {/* Canonical + hreflang */}
        <link rel="canonical" href={`https://pdfmaspro.com${tool.path}`} />
        <link rel="alternate" hrefLang="en" href={`https://pdfmaspro.com${tool.path}`} />
        <link rel="alternate" hrefLang="hi" href={`https://pdfmaspro.com${tool.path}?lang=hi`} />
        {/* Freshness signals */}
        <meta property="article:modified_time" content={`${lastUpdated}T00:00:00+05:30`} />
        <meta name="last-modified" content={lastUpdated} />
        {/* ✅ HowTo Schema */}
        <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
      </Helmet>

      <WebAppSchema tool={tool} />
      <FAQSchema faqs={faqs} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://pdfmaspro.com' },
        { name: tool.name, url: `https://pdfmaspro.com${tool.path}` }
      ]} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Breadcrumb */}
            <nav className="text-xs text-gray-500 mb-4" aria-label="Breadcrumb">
              <a href="/" className="hover:text-indigo-400">Home</a>
              <span className="mx-2" aria-hidden="true">›</span>
              <span className="text-gray-300">{tool.name}</span>
            </nav>

            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {tool.name}
            </h1>
            <p className="text-gray-400 mb-2">{tool.description}</p>
            <p className="text-xs text-gray-500 mb-4">Last updated: {lastUpdated}</p>

            {/* Self-contained 134-167 word definition block — primary AI-citation passage */}
            {definition && (
              <p className="text-gray-300 leading-relaxed mb-6 bg-gray-900/40 border border-gray-800 rounded-xl p-4 text-sm">
                {definition}
              </p>
            )}

            {/* Trust micro-badges */}
            <div className="flex flex-wrap gap-2 mb-8" aria-label="Features">
              {['♾️ No Size Limit', '🔒 100% Private', '🚀 No Login', '💯 Free Forever'].map(b => (
                <span key={b} className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1 rounded-full">{b}</span>
              ))}
            </div>

            {/* Tool UI */}
            {children}

            {/* How To Use */}
            <HowToUse steps={steps} />

            {/* Why Use */}
            <WhyUse toolName={tool.name} />

            {/* ✅ In-content Ad — after tool, before FAQ (best CTR position) */}
            <AdSlot slot={import.meta.env.VITE_ADSENSE_SLOT_MID} className="my-8" />

            {/* FAQ */}
            <FAQ items={faqs} />
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 shrink-0">
            {/* ✅ Sidebar Ad — sticky */}
            <div className="sticky top-24 space-y-4">
              <AdSlot slot={import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR} />

              {/* 🏢 Zeeonix Agency Card — Digital Services */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] border border-purple-700/40 rounded-xl p-4 shadow-lg">
                {/* Glow effect */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

                {/* Z Logo */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
                    <span className="text-white font-black text-xl leading-none">Z</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">Zeeonix</p>
                    <p className="text-purple-300 text-xs">Digital Services Agency</p>
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-1.5 mb-4">
                  {[
                    { icon: '🔍', label: 'SEO & Growth Marketing' },
                    { icon: '🌐', label: 'Website Design & Dev' },
                    { icon: '📱', label: 'Full Stack App Development' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="text-sm">{s.icon}</span>
                      <span className="text-gray-300 text-xs">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <a href="https://www.zeeonix.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md">
                  Get Free Consultation →
                </a>
                <p className="text-center text-gray-500 text-[10px] mt-2">zeeonix.com</p>
              </div>

              {/* Related Tools */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <p className="text-sm font-semibold mb-3">🔧 Related Tools</p>
                <div className="space-y-2">
                  {[
                    { name: 'Compress PDF',           path: '/compress' },
                    { name: 'Merge PDF',               path: '/merge' },
                    { name: 'PDF to JPG',              path: '/pdf-to-jpg' },
                    { name: 'OCR PDF',                 path: '/ocr-pdf' },
                    { name: 'Bank Statement Converter',path: '/bank-converter' },
                    { name: 'PDF to Excel',            path: '/pdf-to-excel' },
                    { name: 'E-Signature',             path: '/e-signature' },
                    { name: 'Word to PDF',             path: '/word-to-pdf' },
                  ].filter(t => t.path !== tool.path).slice(0, 6).map(t => (
                    <a key={t.path} href={t.path}
                      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-400 py-1 transition-colors">
                      <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                      {t.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Newsletter CTA */}
              <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-4">
                <p className="text-sm font-semibold mb-1">📬 PDF Tips Newsletter</p>
                <p className="text-xs text-gray-400 mb-3">Monthly guides. India-specific. Free forever.</p>
                <a href="/newsletter"
                  className="block text-center bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors">
                  Subscribe Free →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Bottom Ad — after full content */}
        <AdSlot slot={import.meta.env.VITE_ADSENSE_SLOT_BOTTOM} className="mt-10" />
      </div>
    </>
  )
}

export default PDFToolLayout
