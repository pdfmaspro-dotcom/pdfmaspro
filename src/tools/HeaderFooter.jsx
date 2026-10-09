import React, { useState } from 'react'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function HeaderFooter() {
  const [file, setFile] = useState(null)
  const [headerText, setHeaderText] = useState('')
  const [footerText, setFooterText] = useState('')
  const [fontSize, setFontSize] = useState(10)
  const [position, setPosition] = useState('both')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const addHeaderFooter = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    if (!headerText && !footerText) { alert('Enter at least header or footer text'); return }
    setProcessing(true); setProgress(0)
    try {
      const buffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const pages = pdfDoc.getPages()
      const color = rgb(0.3, 0.3, 0.3)

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const pageLabel = (text) => text.replace('{page}', i + 1).replace('{total}', pages.length)

        if (headerText && (position === 'header' || position === 'both')) {
          const txt = pageLabel(headerText)
          const txtW = font.widthOfTextAtSize(txt, fontSize)
          page.drawText(txt, { x: (width - txtW) / 2, y: height - 20, size: fontSize, font, color })
        }
        if (footerText && (position === 'footer' || position === 'both')) {
          const txt = pageLabel(footerText)
          const txtW = font.widthOfTextAtSize(txt, fontSize)
          page.drawText(txt, { x: (width - txtW) / 2, y: 10, size: fontSize, font, color })
        }
        setProgress(((i + 1) / pages.length) * 100)
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'header-footer-added.pdf' })
    } catch (err) {
      alert('Error: ' + err.message)
    } finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ Header/Footer added successfully!</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null) }} className="btn-secondary w-full mt-3">Process Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(f) => setFile(f[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <div className="mt-6 space-y-4">
            <p className="text-xs text-gray-500">Tip: Use <code className="bg-gray-800 px-1 rounded">{'{page}'}</code> for page number and <code className="bg-gray-800 px-1 rounded">{'{total}'}</code> for total pages.</p>
            <div>
              <label className="block text-sm font-medium mb-2">Header Text</label>
              <input type="text" value={headerText} onChange={e => setHeaderText(e.target.value)}
                placeholder="e.g. My Company | Confidential"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Footer Text</label>
              <input type="text" value={footerText} onChange={e => setFooterText(e.target.value)}
                placeholder="e.g. Page {page} of {total}"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Font Size: {fontSize}px</label>
              <input type="range" min="8" max="16" step="1" value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))} className="w-full" />
            </div>
          </div>
          <button onClick={addHeaderFooter} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Adding...' : 'Add Header / Footer'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default HeaderFooter
