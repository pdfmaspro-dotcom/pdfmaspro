import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DownloadButton from '../components/DownloadButton'

const PRESETS = {
  'A4':     { width: 595.28, height: 841.89 },
  'A3':     { width: 841.89, height: 1190.55 },
  'A5':     { width: 419.53, height: 595.28 },
  'Letter': { width: 612, height: 792 },
  'Legal':  { width: 612, height: 1008 },
  'Custom': null,
}

function BlankPDF() {
  const [preset, setPreset] = useState('A4')
  const [orientation, setOrientation] = useState('portrait')
  const [pageCount, setPageCount] = useState(1)
  const [customW, setCustomW] = useState(595)
  const [customH, setCustomH] = useState(842)
  const [result, setResult] = useState(null)
  const [processing, setProcessing] = useState(false)

  const create = async () => {
    setProcessing(true)
    try {
      const pdfDoc = await PDFDocument.create()
      let w, h
      if (preset === 'Custom') { w = Number(customW); h = Number(customH) }
      else { w = PRESETS[preset].width; h = PRESETS[preset].height }
      if (orientation === 'landscape') [w, h] = [h, w]
      for (let i = 0; i < pageCount; i++) pdfDoc.addPage([w, h])
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: `blank-${preset.toLowerCase()}-${pageCount}pages.pdf` })
    } catch (err) {
      alert('Error: ' + err.message)
    } finally { setProcessing(false) }
  }

  return (
    <div>
      <div className="card space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Page Size</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {Object.keys(PRESETS).map(p => (
              <button key={p} onClick={() => setPreset(p)}
                className={`py-2 px-3 rounded-lg border text-sm transition-all ${preset === p ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {preset === 'Custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Width (pts)</label>
              <input type="number" value={customW} onChange={e => setCustomW(e.target.value)} min="100" max="2000"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Height (pts)</label>
              <input type="number" value={customH} onChange={e => setCustomH(e.target.value)} min="100" max="2000"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        )}

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

        <div>
          <label className="block text-sm font-medium mb-2">Number of Pages: {pageCount}</label>
          <input type="range" min="1" max="50" step="1" value={pageCount}
            onChange={e => setPageCount(Number(e.target.value))} className="w-full" />
        </div>

        <button onClick={create} disabled={processing} className="btn-primary w-full">
          {processing ? 'Creating...' : `Create ${pageCount} Page Blank PDF`}
        </button>
      </div>

      {result && (
        <div className="card text-center mt-4">
          <p className="text-green-400 mb-4">✓ Blank PDF created!</p>
          <DownloadButton url={result.url} filename={result.filename} />
          <button onClick={() => setResult(null)} className="btn-secondary w-full mt-3">Create Another</button>
        </div>
      )}
    </div>
  )
}

export default BlankPDF
