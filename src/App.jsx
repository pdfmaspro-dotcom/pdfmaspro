import React, { useEffect, lazy, Suspense, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useLang } from './context/LanguageContext'
import { getTranslation } from './data/translations'
import { OrganizationSchema } from './components/SchemaMarkup'
import LanguageSwitcher from './components/LanguageSwitcher'
import SupportModal from './components/SupportModal'
import Logo from './components/Logo'
import ToolIcon from './components/ToolIcon'
import { AppErrorBoundary, ToolErrorBoundary } from './components/ErrorBoundary'
import Home from './pages/Home'
import About from './pages/About'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Alternative from './pages/Alternative'
import Newsletter from './pages/Newsletter'
import NotFound from './pages/NotFound'
import PDFToolLayout from './components/PDFToolLayout'

// ─── Lazy Loaded Tools ────────────────────────────────────────────────────────
const Merge          = lazy(() => import('./tools/Merge'))
const Split          = lazy(() => import('./tools/Split'))
const ExtractPages   = lazy(() => import('./tools/ExtractPages'))
const DeletePages    = lazy(() => import('./tools/DeletePages'))
const ReorderPages   = lazy(() => import('./tools/ReorderPages'))
const Rotate         = lazy(() => import('./tools/Rotate'))
const PDFToJPG       = lazy(() => import('./tools/PDFToJPG'))
const PDFToPNG       = lazy(() => import('./tools/PDFToPNG'))
const PDFToText      = lazy(() => import('./tools/PDFToText'))
const JPGToPDF       = lazy(() => import('./tools/JPGToPDF'))
const PNGToPDF       = lazy(() => import('./tools/PNGToPDF'))
const ImagesToPDF    = lazy(() => import('./tools/ImagesToPDF'))
const Grayscale      = lazy(() => import('./tools/Grayscale'))
const Watermark      = lazy(() => import('./tools/Watermark'))
const PageNumbers    = lazy(() => import('./tools/PageNumbers'))
const Unlock         = lazy(() => import('./tools/Unlock'))
const Compress       = lazy(() => import('./tools/Compress'))
const BankConverter  = lazy(() => import('./tools/BankConverter'))
const ResizePDF      = lazy(() => import('./tools/ResizePDF'))
const HeaderFooter   = lazy(() => import('./tools/HeaderFooter'))
const PDFWordCount   = lazy(() => import('./tools/PDFWordCount'))
const DuplicatePages = lazy(() => import('./tools/DuplicatePages'))
const BlankPDF       = lazy(() => import('./tools/BlankPDF'))
const PDFThumbnail   = lazy(() => import('./tools/PDFThumbnail'))
const PDFMarginEditor= lazy(() => import('./tools/PDFMarginEditor'))
const PDFBookmarks   = lazy(() => import('./tools/PDFBookmarks'))
const GSTInvoiceReader=lazy(() => import('./tools/GSTInvoiceReader'))
const OCRPDF         = lazy(() => import('./tools/OCRPDF'))
const ExcelToPDF     = lazy(() => import('./tools/ExcelToPDF'))
const PDFToExcel     = lazy(() => import('./tools/PDFToExcel'))
const WordToPDF      = lazy(() => import('./tools/WordToPDF'))      // NEW
const ESignature     = lazy(() => import('./tools/ESignature'))     // NEW

// ─── Tools Registry (single source of truth) ─────────────────────────────────
export const tools = [
  // Organize
  { id: 1,  name: 'Merge PDF',                path: '/merge',           description: 'Combine multiple PDFs into one document',                    category: 'organize', component: Merge },
  { id: 2,  name: 'Split PDF',                path: '/split',           description: 'Split PDF into separate pages or ranges',                    category: 'organize', component: Split },
  { id: 3,  name: 'Extract Pages',            path: '/extract-pages',   description: 'Extract specific pages from PDF',                            category: 'organize', component: ExtractPages },
  { id: 4,  name: 'Delete Pages',             path: '/delete-pages',    description: 'Remove unwanted pages from PDF',                             category: 'organize', component: DeletePages },
  { id: 5,  name: 'Reorder Pages',            path: '/reorder-pages',   description: 'Drag & drop to reorder PDF pages',                           category: 'organize', component: ReorderPages },
  { id: 6,  name: 'Rotate Pages',             path: '/rotate',          description: 'Rotate PDF pages 90°, 180° or 270°',                         category: 'organize', component: Rotate },
  { id: 7,  name: 'Duplicate Pages',          path: '/duplicate-pages', description: 'Copy pages multiple times within a PDF',                     category: 'organize', component: DuplicatePages },
  { id: 8,  name: 'PDF Bookmarks',            path: '/pdf-bookmarks',   description: 'Add clickable bookmarks & table of contents',                category: 'organize', component: PDFBookmarks },
  // Convert
  { id: 9,  name: 'PDF to JPG',               path: '/pdf-to-jpg',      description: 'Convert each PDF page to JPG image',                         category: 'convert',  component: PDFToJPG },
  { id: 10, name: 'PDF to PNG',               path: '/pdf-to-png',      description: 'Convert each PDF page to PNG image',                         category: 'convert',  component: PDFToPNG },
  { id: 11, name: 'PDF to Text',              path: '/pdf-to-text',     description: 'Extract all text content from PDF',                          category: 'convert',  component: PDFToText },
  { id: 12, name: 'JPG to PDF',               path: '/jpg-to-pdf',      description: 'Convert JPG images to PDF',                                  category: 'convert',  component: JPGToPDF },
  { id: 13, name: 'PNG to PDF',               path: '/png-to-pdf',      description: 'Convert PNG images to PDF',                                  category: 'convert',  component: PNGToPDF },
  { id: 14, name: 'Images to PDF',            path: '/images-to-pdf',   description: 'Multiple images combined into one PDF',                      category: 'convert',  component: ImagesToPDF },
  { id: 15, name: 'PDF Thumbnails',           path: '/pdf-thumbnails',  description: 'Generate preview images for every PDF page',                 category: 'convert',  component: PDFThumbnail },
  { id: 16, name: 'Blank PDF Creator',        path: '/blank-pdf',       description: 'Create blank PDF — A4, Letter, A3, custom size',             category: 'convert',  component: BlankPDF },
  { id: 17, name: 'Bank Statement Converter', path: '/bank-converter',  description: 'Convert Indian bank statement PDF to Excel/CSV',             category: 'convert',  component: BankConverter },
  { id: 18, name: 'GST Invoice Reader',       path: '/gst-invoice',     description: 'Extract GSTIN, amounts & details from GST invoices',         category: 'convert',  component: GSTInvoiceReader },
  { id: 30, name: 'Excel to PDF',             path: '/excel-to-pdf',    description: 'Convert Excel / CSV spreadsheets to PDF',                    category: 'convert',  component: ExcelToPDF },
  { id: 31, name: 'PDF to Excel',             path: '/pdf-to-excel',    description: 'Extract tables from PDF into Excel or CSV',                  category: 'convert',  component: PDFToExcel },
  { id: 32, name: 'Word to PDF',              path: '/word-to-pdf',     description: 'Convert .docx and .txt documents to PDF',                    category: 'convert',  component: WordToPDF },
  // Optimize
  { id: 19, name: 'Compress PDF',             path: '/compress',        description: 'Reduce PDF file size — no restrictions',                     category: 'optimize', component: Compress },
  { id: 20, name: 'Resize PDF',               path: '/resize-pdf',      description: 'Change page size — A4, Letter, A3, Legal and more',          category: 'optimize', component: ResizePDF },
  { id: 21, name: 'Add Header / Footer',      path: '/header-footer',   description: 'Add custom text header & footer to every page',              category: 'optimize', component: HeaderFooter },
  { id: 22, name: 'Margin Editor',            path: '/margin-editor',   description: 'Add or adjust margins on all PDF pages',                     category: 'optimize', component: PDFMarginEditor },
  { id: 23, name: 'Grayscale PDF',            path: '/grayscale',       description: 'Convert color PDF to black and white',                       category: 'optimize', component: Grayscale },
  { id: 24, name: 'Watermark PDF',            path: '/watermark',       description: 'Add custom text watermark to PDF pages',                     category: 'optimize', component: Watermark },
  { id: 25, name: 'Page Numbers',             path: '/page-numbers',    description: 'Add page numbers to every PDF page',                         category: 'optimize', component: PageNumbers },
  // Utility
  { id: 26, name: 'PDF Word Count',           path: '/word-count',      description: 'Count words, characters, pages & reading time',              category: 'utility',  component: PDFWordCount },
  { id: 27, name: 'OCR PDF',                  path: '/ocr-pdf',         description: 'Extract text from scanned PDFs using OCR',                   category: 'utility',  component: OCRPDF },
  // Security
  { id: 29, name: 'Unlock PDF',               path: '/unlock',          description: 'Remove password from PDF',                                   category: 'security', component: Unlock },
  { id: 33, name: 'E-Signature',              path: '/e-signature',     description: 'Sign PDF digitally — draw, type or upload signature',        category: 'security', component: ESignature },
]

// Tool count (dynamic — always correct)
export const TOOL_COUNT = tools.length

// Loading spinner for lazy tools
const ToolLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <svg className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
      </svg>
      <p className="text-gray-400 text-sm">Loading tool...</p>
    </div>
  </div>
)

// ─── Search Bar ───────────────────────────────────────────────────────────────
function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const inputRef = React.useRef(null)

  const search = (q) => {
    setQuery(q)
    if (!q.trim()) { setResults([]); setOpen(false); return }
    const q2 = q.toLowerCase()
    const filtered = tools.filter(t =>
      t.name.toLowerCase().includes(q2) ||
      t.description.toLowerCase().includes(q2) ||
      t.category.toLowerCase().includes(q2)
    ).slice(0, 7)
    setResults(filtered)
    setOpen(filtered.length > 0)
    setHi(0)
  }

  const handleKey = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHi(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter' && results[hi]) { window.location.href = results[hi].path; setOpen(false); setQuery('') }
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
  }

  return (
    <div className="relative" style={{ width: '230px' }}>
      <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 focus-within:border-indigo-500 transition-colors">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input ref={inputRef} type="text" value={query}
          onChange={e => search(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => query && setOpen(results.length > 0)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          placeholder={`Search ${TOOL_COUNT} tools...`}
          className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full" />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
            className="text-gray-500 hover:text-white text-xs">✕</button>
        )}
      </div>
      {open && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl z-50">
          {results.map((tool, i) => (
            <a key={tool.id} href={tool.path}
              className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${i === hi ? 'bg-indigo-900/50 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              onMouseEnter={() => setHi(i)}>
              <ToolIcon toolId={tool.id} category={tool.category} size={16} />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{tool.name}</div>
                <div className="text-xs text-gray-500 truncate">{tool.description}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const location = useLocation()
  const { lang } = useLang()
  const t = (key) => getTranslation(lang, key)
  const [showSupport, setShowSupport] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    const tool = tools.find(t => t.path === location.pathname)
    if (tool) {
      document.title = `${tool.name} Online Free | PDF Master Pro`
    } else {
      document.title = `${TOOL_COUNT} Free PDF Tools — No Limits, No Login | PDF Master Pro`
    }
    document.documentElement.lang = lang
  }, [location, lang])

  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <OrganizationSchema />
        <Helmet>
          <meta name="robots" content="index, follow" />
          <meta name="author" content="PDF Master Pro" />
        </Helmet>

        {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}

        {/* Header */}
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
          <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
            <Logo />
            <div className="flex items-center gap-3 flex-wrap">
              <div className="hidden sm:block">
                <SearchBar />
              </div>
              <nav className="hidden md:flex items-center gap-4 text-sm text-gray-400">
                <Link to="/blog"          className="hover:text-indigo-400 transition-colors">Blog</Link>
                <Link to="/why-choose-us" className="hover:text-indigo-400 transition-colors">Why Us?</Link>
                <Link to="/about"         className="hover:text-indigo-400 transition-colors">About</Link>
              </nav>
              <LanguageSwitcher />
              <button onClick={() => setShowSupport(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                <span className="hidden sm:inline">Support</span>
              </button>
            </div>
          </div>
          {/* Mobile search */}
          <div className="sm:hidden px-4 pb-3">
            <SearchBar />
          </div>
        </header>

        <Routes>
          <Route path="/"                 element={<Home tools={tools} toolCount={TOOL_COUNT} onSupportClick={() => setShowSupport(true)} lang={lang} />} />
          <Route path="/about"            element={<About />} />
          <Route path="/privacy-policy"   element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/contact"          element={<Contact />} />
          <Route path="/blog"             element={<Blog />} />
          <Route path="/blog/:slug"       element={<BlogPost />} />
          <Route path="/newsletter"       element={<Newsletter />} />
          <Route path="/why-choose-us"    element={<Alternative />} />
          <Route path="*"                 element={<NotFound />} />

          {/* All tool routes — lazy loaded + error boundary per tool */}
          {tools.map(tool => (
            <Route key={tool.path} path={tool.path}
              element={
                <PDFToolLayout tool={tool}>
                  <ToolErrorBoundary toolName={tool.name}>
                    <Suspense fallback={<ToolLoader />}>
                      <tool.component />
                    </Suspense>
                  </ToolErrorBoundary>
                </PDFToolLayout>
              }
            />
          ))}
        </Routes>

        {/* Footer */}
        <footer className="bg-gray-900/50 border-t border-gray-800 mt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <Logo className="mb-3" />
                <p className="text-gray-400 text-sm mt-2">{t('footer_tagline')}</p>
                <p className="text-gray-500 text-xs mt-2">{TOOL_COUNT} free tools. No file size limits, no daily caps, no login required.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Popular Tools</h4>
                <ul className="space-y-1.5 text-sm text-gray-400">
                  {['/merge', '/compress', '/ocr-pdf', '/gst-invoice', '/bank-converter', '/e-signature', '/word-to-pdf'].map(path => {
                    const tool = tools.find(t => t.path === path)
                    return tool ? <li key={path}><Link to={path} className="hover:text-indigo-400">{tool.name}</Link></li> : null
                  })}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">{t('footer_legal')}</h4>
                <ul className="space-y-1.5 text-sm text-gray-400">
                  <li><Link to="/privacy-policy"   className="hover:text-indigo-400">{t('privacy_policy')}</Link></li>
                  <li><Link to="/terms-of-service" className="hover:text-indigo-400">{t('terms_of_service')}</Link></li>
                  <li><Link to="/contact"          className="hover:text-indigo-400">{t('contact')}</Link></li>
                  <li><Link to="/about"            className="hover:text-indigo-400">{t('about')}</Link></li>
                  <li><Link to="/blog"             className="hover:text-indigo-400">Blog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">{t('footer_support')}</h4>
                <button onClick={() => setShowSupport(true)}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all text-sm">
                  ❤️ {t('buy_coffee')}
                </button>
                <div className="mt-4">
                  <Link to="/newsletter" className="text-sm text-indigo-400 hover:text-indigo-300">📬 Subscribe Newsletter</Link>
                </div>
                <div className="mt-3"><LanguageSwitcher /></div>
              </div>
            </div>
            <div className="text-center text-gray-500 text-xs mt-8 pt-8 border-t border-gray-800">
              © {new Date().getFullYear()} PDF Master Pro — {t('footer_copy')}
            </div>
          </div>
        </footer>
      </div>
    </AppErrorBoundary>
  )
}

export default App
