import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function PDFMarginEditor() {
  const [file, setFile] = useState(null)
  const [margins, setMargins] = useState({ top: 40, bottom: 40, left: 40, right: 40 })
  const [linked, setLinked] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const setMargin = (side, val) => {
    const v = Number(val)
    if (linked) setMargins({ top: v, bottom: v, left: v, right: v })
    else setMargins(prev => ({ ...prev, [side]: v }))
  }

  const applyMargins = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0)
    try {
      const buffer = await file.arrayBuffer()
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      const newDoc = await PDFDocument.create()
      const pages = srcDoc.getPages()

      for (let i = 0; i < pages.length; i++) {
        const origPage = pages[i]
        const { width, height } = origPage.getSize()
        const newW = width + margins.left + margins.right
        const newH = height + margins.top + margins.bottom
        const [embedded] = await newDoc.embedPages([origPage])
        const newPage = newDoc.addPage([newW, newH])
        newPage.drawPage(embedded, { x: margins.left, y: margins.bottom, width, height })
        setProgress(((i + 1) / pages.length) * 100)
      }

      const pdfBytes = await newDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'margin-adjusted.pdf' })
    } catch (err) {
      alert('Error: ' + err.message)
    } finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ Margins adjusted successfully!</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null) }} className="btn-secondary w-full mt-3">Process Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(f) => setFile(f[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium">Margin Settings (points)</label>
              <button onClick={() => setLinked(!linked)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${linked ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-gray-700 text-gray-400'}`}>
                {linked ? '🔗 Linked' : '⛓️ Unlinked'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['top', 'bottom', 'left', 'right'].map(side => (
                <div key={side}>
                  <label className="block text-sm text-gray-400 mb-1 capitalize">{side}: {margins[side]}pt</label>
                  <input type="range" min="0" max="150" step="5" value={margins[side]}
                    onChange={e => setMargin(side, e.target.value)} className="w-full" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">72 points = 1 inch = 2.54 cm</p>
          </div>
          <button onClick={applyMargins} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Applying Margins...' : 'Apply Margins'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default PDFMarginEditor
