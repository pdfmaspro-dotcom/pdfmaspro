import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

const PAGE_SIZES = {
  'A4':     { width: 595.28, height: 841.89, label: 'A4 (210 × 297 mm)' },
  'A3':     { width: 841.89, height: 1190.55, label: 'A3 (297 × 420 mm)' },
  'A5':     { width: 419.53, height: 595.28, label: 'A5 (148 × 210 mm)' },
  'Letter': { width: 612, height: 792, label: 'US Letter (8.5 × 11 in)' },
  'Legal':  { width: 612, height: 1008, label: 'US Legal (8.5 × 14 in)' },
  'Tabloid':{ width: 792, height: 1224, label: 'Tabloid (11 × 17 in)' },
}

function ResizePDF() {
  const [file, setFile] = useState(null)
  const [targetSize, setTargetSize] = useState('A4')
  const [orientation, setOrientation] = useState('portrait')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const resize = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0)
    try {
      const buffer = await file.arrayBuffer()
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      const newDoc = await PDFDocument.create()
      const pages = srcDoc.getPages()
      let { width, height } = PAGE_SIZES[targetSize]
      if (orientation === 'landscape') { [width, height] = [height, width] }

      for (let i = 0; i < pages.length; i++) {
        const [copiedPage] = await newDoc.copyPages(srcDoc, [i])
        copiedPage.setSize(width, height)
        const origW = pages[i].getWidth()
        const origH = pages[i].getHeight()
        const scale = Math.min(width / origW, height / origH)
        const offsetX = (width - origW * scale) / 2
        const offsetY = (height - origH * scale) / 2
        copiedPage.resetPosition()
        copiedPage.scale(scale, scale)
        copiedPage.translateContent(offsetX / scale, offsetY / scale)
        newDoc.addPage(copiedPage)
        setProgress(((i + 1) / pages.length) * 100)
      }

      const pdfBytes = await newDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: `resized-${targetSize.toLowerCase()}.pdf` })
    } catch (err) {
      alert('Error resizing PDF: ' + err.message)
    } finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ PDF resized to {targetSize} successfully!</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null) }} className="btn-secondary w-full mt-3">Resize Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(f) => setFile(f[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target Page Size</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(PAGE_SIZES).map(([key, val]) => (
                  <button key={key} onClick={() => setTargetSize(key)}
                    className={`p-3 rounded-lg border text-sm text-left transition-all ${targetSize === key ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                    <span className="font-semibold block">{key}</span>
                    <span className="text-xs text-gray-500">{val.label.split('(')[1]?.replace(')', '')}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Orientation</label>
              <div className="flex gap-3">
                {['portrait', 'landscape'].map(o => (
                  <button key={o} onClick={() => setOrientation(o)}
                    className={`flex-1 py-2 rounded-lg border text-sm capitalize transition-all ${orientation === o ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                    {o === 'portrait' ? '📄' : '🖥️'} {o}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={resize} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Resizing...' : `Resize to ${targetSize}`}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default ResizePDF
