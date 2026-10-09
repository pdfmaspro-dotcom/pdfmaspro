import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function ExtractPages() {
  const [file, setFile] = useState(null)
  const [pageNumbers, setPageNumbers] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const handleExtract = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    const pages = pageNumbers.split(',').map(p => parseInt(p.trim()) - 1).filter(p => !isNaN(p))
    if (pages.length === 0) { alert('Please enter valid page numbers (e.g., 1,3,5)'); return }
    setProcessing(true); setProgress(0)
    try {
      const fileBuffer = await file.arrayBuffer()
      const sourcePdf = await PDFDocument.load(fileBuffer)
      const newPdf = await PDFDocument.create()
      for (let i = 0; i < pages.length; i++) {
        if (pages[i] >= 0 && pages[i] < sourcePdf.getPageCount()) {
          const [page] = await newPdf.copyPages(sourcePdf, [pages[i]])
          newPdf.addPage(page)
        }
        setProgress(((i + 1) / pages.length) * 100)
      }
      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'extracted_pages.pdf' })
    } catch (error) { alert('Error extracting pages') }
    finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ Pages extracted successfully!</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null); setPageNumbers('') }} className="btn-secondary w-full mt-3">Extract Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(files) => setFile(files[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Page numbers to extract (comma-separated)</label>
            <input type="text" value={pageNumbers} onChange={e => setPageNumbers(e.target.value)} placeholder="e.g., 1,3,5" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500" />
          </div>
          <button onClick={handleExtract} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Extracting...' : 'Extract Pages'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default ExtractPages
