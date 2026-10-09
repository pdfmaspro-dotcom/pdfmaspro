import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function ReorderPages() {
  const [file, setFile] = useState(null)
  const [pageOrder, setPageOrder] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const handleReorder = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    const order = pageOrder.split(',').map(p => parseInt(p.trim()) - 1).filter(p => !isNaN(p))
    if (order.length === 0) { alert('Please enter valid page order (e.g., 2,1,3)'); return }
    setProcessing(true); setProgress(0)
    try {
      const fileBuffer = await file.arrayBuffer()
      const sourcePdf = await PDFDocument.load(fileBuffer)
      const newPdf = await PDFDocument.create()
      for (let i = 0; i < order.length; i++) {
        if (order[i] >= 0 && order[i] < sourcePdf.getPageCount()) {
          const [page] = await newPdf.copyPages(sourcePdf, [order[i]])
          newPdf.addPage(page)
        }
        setProgress(((i + 1) / order.length) * 100)
      }
      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'reordered.pdf' })
    } catch (error) { alert('Error reordering pages') }
    finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ Pages reordered successfully!</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null); setPageOrder('') }} className="btn-secondary w-full mt-3">Reorder Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(files) => setFile(files[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">New page order (comma-separated page numbers)</label>
            <input type="text" value={pageOrder} onChange={e => setPageOrder(e.target.value)} placeholder="e.g., 2,1,3,4" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500" />
          </div>
          <button onClick={handleReorder} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Reordering...' : 'Reorder Pages'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default ReorderPages
