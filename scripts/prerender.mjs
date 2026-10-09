// scripts/prerender.mjs
//
// AI search crawlers (GPTBot/OAI-SearchBot, ClaudeBot, PerplexityBot) do not execute JavaScript.
// This SPA is client-side-rendered, so without this step every tool route would serve the same
// generic homepage <head> to a non-JS crawler. This script runs after `vite build` and writes a
// real, route-specific static HTML file for every tool/page — title, meta, canonical, JSON-LD,
// and a server-rendered definition + FAQ block — while leaving the existing client bundle intact
// so the SPA still hydrates and becomes fully interactive for real users.
//
// Usage: vite build && node scripts/prerender.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import seoMeta from '../src/data/seoMeta.js'
import toolDefinitions from '../src/data/toolDefinitions.js'
import { toolFAQs, defaultFAQs } from '../src/data/toolFAQs.js'

const DOMAIN = 'https://pdfmaspro.com'
const DIST = path.resolve('dist')
const LAST_UPDATED = '2026-10-08'

// Static tool route metadata (kept independent from src/App.jsx so this script can run in plain
// Node without pulling in browser-only tool components like pdfjs-dist / react-dropzone).
const tools = [
  { name: 'Merge PDF', path: '/merge', description: 'Combine multiple PDFs into one document' },
  { name: 'Split PDF', path: '/split', description: 'Split PDF into separate pages or ranges' },
  { name: 'Extract Pages', path: '/extract-pages', description: 'Extract specific pages from PDF' },
  { name: 'Delete Pages', path: '/delete-pages', description: 'Remove unwanted pages from PDF' },
  { name: 'Reorder Pages', path: '/reorder-pages', description: 'Drag & drop to reorder PDF pages' },
  { name: 'Rotate Pages', path: '/rotate', description: 'Rotate PDF pages 90°, 180° or 270°' },
  { name: 'Duplicate Pages', path: '/duplicate-pages', description: 'Copy pages multiple times within a PDF' },
  { name: 'PDF Bookmarks', path: '/pdf-bookmarks', description: 'Add clickable bookmarks & table of contents' },
  { name: 'PDF to JPG', path: '/pdf-to-jpg', description: 'Convert each PDF page to JPG image' },
  { name: 'PDF to PNG', path: '/pdf-to-png', description: 'Convert each PDF page to PNG image' },
  { name: 'PDF to Text', path: '/pdf-to-text', description: 'Extract all text content from PDF' },
  { name: 'JPG to PDF', path: '/jpg-to-pdf', description: 'Convert JPG images to PDF' },
  { name: 'PNG to PDF', path: '/png-to-pdf', description: 'Convert PNG images to PDF' },
  { name: 'Images to PDF', path: '/images-to-pdf', description: 'Multiple images combined into one PDF' },
  { name: 'PDF Thumbnails', path: '/pdf-thumbnails', description: 'Generate preview images for every PDF page' },
  { name: 'Blank PDF Creator', path: '/blank-pdf', description: 'Create blank PDF — A4, Letter, A3, custom size' },
  { name: 'Bank Statement Converter', path: '/bank-converter', description: 'Convert Indian bank statement PDF to Excel/CSV' },
  { name: 'GST Invoice Reader', path: '/gst-invoice', description: 'Extract GSTIN, amounts & details from GST invoices' },
  { name: 'Excel to PDF', path: '/excel-to-pdf', description: 'Convert Excel / CSV spreadsheets to PDF' },
  { name: 'PDF to Excel', path: '/pdf-to-excel', description: 'Extract tables from PDF into Excel or CSV' },
  { name: 'Word to PDF', path: '/word-to-pdf', description: 'Convert .docx and .txt documents to PDF' },
  { name: 'Compress PDF', path: '/compress', description: 'Reduce PDF file size — no restrictions' },
  { name: 'Resize PDF', path: '/resize-pdf', description: 'Change page size — A4, Letter, A3, Legal and more' },
  { name: 'Add Header / Footer', path: '/header-footer', description: 'Add custom text header & footer to every page' },
  { name: 'Margin Editor', path: '/margin-editor', description: 'Add or adjust margins on all PDF pages' },
  { name: 'Grayscale PDF', path: '/grayscale', description: 'Convert color PDF to black and white' },
  { name: 'Watermark PDF', path: '/watermark', description: 'Add custom text watermark to PDF pages' },
  { name: 'Page Numbers', path: '/page-numbers', description: 'Add page numbers to every PDF page' },
  { name: 'PDF Word Count', path: '/word-count', description: 'Count words, characters, pages & reading time' },
  { name: 'OCR PDF', path: '/ocr-pdf', description: 'Extract text from scanned PDFs using OCR' },
  { name: 'Unlock PDF', path: '/unlock', description: 'Remove password from PDF' },
  { name: 'E-Signature', path: '/e-signature', description: 'Sign PDF digitally — draw, type or upload signature' },
]

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildHead(template, { title, description, keywords, urlPath }) {
  const url = `${DOMAIN}${urlPath}`
  let html = template
  html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
  html = html.replace(/<meta name="description" content=".*?" \/>/s, `<meta name="description" content="${escapeHtml(description)}" />`)
  html = html.replace(/<meta name="keywords" content=".*?" \/>/s, `<meta name="keywords" content="${escapeHtml(keywords)}" />`)
  html = html.replace(/<meta property="og:title" content=".*?" \/>/s, `<meta property="og:title" content="${escapeHtml(title)}" />`)
  html = html.replace(/<meta property="og:description" content=".*?" \/>/s, `<meta property="og:description" content="${escapeHtml(description)}" />`)
  html = html.replace(/<meta property="og:url" content=".*?" \/>/s, `<meta property="og:url" content="${url}" />`)
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/s, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/s, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
  html = html.replace(/<link rel="canonical" href=".*?" \/>/s, `<link rel="canonical" href="${url}" />`)
  return html
}

function buildSchemas({ tool, urlPath, faqs }) {
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${tool.name} — PDF Master Pro`,
    "url": `${DOMAIN}${urlPath}`,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": tool.description,
    "datePublished": "2025-01-01",
    "dateModified": LAST_UPDATED,
    "featureList": ["No file size limits", "No login required", "100% private — files stay in browser", "Free forever"]
  }
  const faqSchema = faqs?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
  } : null
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": DOMAIN },
      { "@type": "ListItem", "position": 2, "name": tool.name, "item": `${DOMAIN}${urlPath}` }
    ]
  }
  return [webApp, faqSchema, breadcrumb].filter(Boolean)
    .map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n    ')
}

function buildStaticContent({ tool, definition, faqs, urlPath }) {
  const faqHtml = faqs?.length
    ? `<section aria-label="FAQ"><h2>${escapeHtml(tool.name)} — Frequently Asked Questions</h2>${faqs.map(f =>
        `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`).join('')}</section>`
    : ''
  return `<div id="prerendered-seo-content" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);">
      <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; ${escapeHtml(tool.name)}</nav>
      <h1>${escapeHtml(tool.name)}</h1>
      <p>${escapeHtml(tool.description)}</p>
      <p>Last updated: ${LAST_UPDATED}</p>
      ${definition ? `<p>${escapeHtml(definition)}</p>` : ''}
      ${faqHtml}
    </div>`
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('dist/ not found — run `vite build` before prerender.')
    process.exit(1)
  }
  const template = await readFile(path.join(DIST, 'index.html'), 'utf-8')

  for (const tool of tools) {
    const key = tool.path.replace('/', '')
    const meta = seoMeta[key] || {
      title: `${tool.name} Online Free | PDF Master Pro`,
      description: `${tool.description} — Free online tool with no file size limits, no login required, 100% private.`,
      keywords: `${tool.name.toLowerCase()}, free online pdf, pdf tools india`,
    }
    const faqs = toolFAQs[tool.path] ? [...toolFAQs[tool.path], ...defaultFAQs.slice(0, 2)] : defaultFAQs
    const definition = toolDefinitions[tool.path]

    let html = buildHead(template, { ...meta, urlPath: tool.path })
    const schemas = buildSchemas({ tool, urlPath: tool.path, faqs })
    const staticContent = buildStaticContent({ tool, definition, faqs, urlPath: tool.path })

    html = html.replace('</head>', `    ${schemas}\n  </head>`)
    html = html.replace('<div id="root"></div>', `<div id="root">${staticContent}</div>`)

    const outDir = path.join(DIST, tool.path)
    await mkdir(outDir, { recursive: true })
    await writeFile(path.join(outDir, 'index.html'), html, 'utf-8')
    console.log(`prerendered ${tool.path}`)
  }

  console.log(`\nDone — ${tools.length} tool routes prerendered with crawlable title/meta/schema/content.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
