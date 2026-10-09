import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function OCRPDF() {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [ocrLoaded, setOcrLoaded] = useState(false)
  const [outputMode, setOutputMode] = useState('text')

  const loadTesseract = () => new Promise((resolve, reject) => {
    if (window.Tesseract) { resolve(window.Tesseract); return }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js'
    script.onload = () => { setOcrLoaded(true); resolve(window.Tesseract) }
    script.onerror = reject
    document.head.appendChild(script)
  })

  const runOCR = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0); setResult(null)
    try {
      setStatus('Loading OCR engine...')
      const Tesseract = await loadTesseract()

      const buffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      const allText = []

      for (let i = 1; i <= pdf.numPages; i++) {
        setStatus(`Processing page ${i} of ${pdf.numPages}...`)
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2.0 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width; canvas.height = viewport.height
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise

        const { data: { text } } = await Tesseract.recognize(canvas, 'eng+hin', {
          logger: m => {
            if (m.status === 'recognizing text') {
              const pageBase = ((i - 1) / pdf.numPages) * 100
              const pageContrib = (1 / pdf.numPages) * 100
              setProgress(Math.round(pageBase + pageContrib * m.progress))
            }
          }
        })
        allText.push({ page: i, text: text.trim() })
      }

      setStatus('Done!')
      setProgress(100)

      if (outputMode === 'text') {
        const combined = allText.map(p => `--- Page ${p.page} ---\n${p.text}`).join('\n\n')
        const blob = new Blob([combined], { type: 'text/plain' })
        setResult({ type: 'text', url: URL.createObjectURL(blob), filename: 'ocr-output.txt', preview: combined.substring(0, 1500), pages: allText.length })
      } else {
        const pdfDoc = await PDFDocument.create()
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        for (const p of allText) {
          const page = pdfDoc.addPage([595, 842])
          const lines = p.text.split('\n')
          let y = 800
          page.drawText(`Page ${p.page}`, { x: 50, y, size: 12, font, color: rgb(0.4, 0.4, 0.8) }); y -= 20
          for (const line of lines) {
            if (y < 50) { break }
            const safeStr = line.replace(/[^\x00-\x7F]/g, ' ')
            if (safeStr.trim()) {
              page.drawText(safeStr.substring(0, 90), { x: 50, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) })
              y -= 14
            }
          }
        }
        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        setResult({ type: 'pdf', url: URL.createObjectURL(blob), filename: 'ocr-searchable.pdf', pages: allText.length })
      }
    } catch (err) {
      alert('OCR Error: ' + err.message)
      setStatus('')
    } finally { setProcessing(false) }
  }

  return (
    <div>
      <div className="mb-4 p-3 bg-indigo-900/20 border border-indigo-800/50 rounded-lg space-y-1">
        <p className="text-xs text-indigo-300">🔍 Converts scanned/image PDFs to searchable text using Tesseract OCR (runs 100% in your browser).</p>
        <p className="text-xs text-gray-500">⚠️ Works best on clearly scanned documents. Handwritten text may have lower accuracy.</p>
      </div>

      <FileUploader onFileSelect={(f) => { setFile(f[0]); setResult(null) }} accept={{ 'application/pdf': ['.pdf'] }} />

      {file && (
        <>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Output Format</label>
            <div className="flex gap-3">
              {[['text', '📄 Text File (.txt)'], ['pdf', '📋 Searchable PDF']].map(([val, label]) => (
                <button key={val} onClick={() => setOutputMode(val)}
                  className={`flex-1 py-2 rounded-lg border text-sm transition-all ${outputMode === val ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={runOCR} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? status || 'Processing...' : 'Start OCR'}
          </button>
        </>
      )}

      {processing && (
        <div className="mt-4">
          <ProgressBar progress={progress} />
          <p className="text-xs text-gray-400 text-center mt-2">{status}</p>
          <p className="text-xs text-gray-500 text-center mt-1">Large files take a few minutes — please wait</p>
        </div>
      )}

      {result && !processing && (
        <div className="mt-6 card">
          <p className="text-green-400 mb-2">✓ OCR complete — {result.pages} page(s) processed</p>
          {result.preview && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-4 max-h-48 overflow-y-auto">
              <p className="text-xs text-gray-400 whitespace-pre-wrap">{result.preview}{result.preview.length >= 1500 ? '...' : ''}</p>
            </div>
          )}
          <a href={result.url} download={result.filename}
            className="btn-primary w-full block text-center py-3">
            ⬇️ Download {result.type === 'text' ? 'Text File' : 'Searchable PDF'}
          </a>
          <button onClick={() => { setResult(null); setFile(null) }} className="btn-secondary w-full mt-3">Process Another</button>
        </div>
      )}
    </div>
  )
}

export default OCRPDF
