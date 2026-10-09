import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function DuplicatePages() {
  const [file, setFile] = useState(null)
  const [copies, setCopies] = useState(2)
  const [mode, setMode] = useState('all')
  const [pageInput, setPageInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const duplicate = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0)
    try {
      const buffer = await file.arrayBuffer()
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      const newDoc = await PDFDocument.create()
      const totalPages = srcDoc.getPages().length

      let pageIndices = []
      if (mode === 'all') {
        pageIndices = Array.from({ length: totalPages }, (_, i) => i)
      } else {
        pageIndices = pageInput.split(',').flatMap(p => {
          const [a, b] = p.split('-').map(n => parseInt(n.trim()) - 1)
          return b !== undefined ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a]
        }).filter(i => i >= 0 && i < totalPages)
      }

      const allIndices = []
      for (let i = 0; i < totalPages; i++) {
        allIndices.push(i)
        if (pageIndices.includes(i)) {
          for (let c = 1; c < copies; c++) allIndices.push(i)
        }
      }

      for (let i = 0; i < allIndices.length; i++) {
        const [page] = await newDoc.copyPages(srcDoc, [allIndices[i]])
        newDoc.addPage(page)
        setProgress(((i + 1) / allIndices.length) * 100)
      }

      const pdfBytes = await newDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'duplicated-pages.pdf' })
    } catch (err) {
      alert('Error: ' + err.message)
    } finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ Pages duplicated successfully!</p>
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
            <div>
              <label className="block text-sm font-medium mb-2">Pages to Duplicate</label>
              <div className="flex gap-3">
                {[['all', 'All Pages'], ['specific', 'Specific Pages']].map(([val, label]) => (
                  <button key={val} onClick={() => setMode(val)}
                    className={`flex-1 py-2 rounded-lg border text-sm transition-all ${mode === val ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {mode === 'specific' && (
              <div>
                <label className="block text-sm font-medium mb-2">Page Numbers</label>
                <input type="text" value={pageInput} onChange={e => setPageInput(e.target.value)}
                  placeholder="e.g. 1, 3, 5-8"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Number of Copies: {copies}</label>
              <input type="range" min="2" max="10" step="1" value={copies}
                onChange={e => setCopies(Number(e.target.value))} className="w-full" />
            </div>
          </div>
          <button onClick={duplicate} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Duplicating...' : 'Duplicate Pages'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default DuplicatePages
