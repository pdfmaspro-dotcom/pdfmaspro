import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function Split() {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState([])

  const handleSplit = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0)
    try {
      const fileBuffer = await file.arrayBuffer()
      const sourcePdf = await PDFDocument.load(fileBuffer)
      const pageCount = sourcePdf.getPageCount()
      const splitResults = []
      for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create()
        const [page] = await newPdf.copyPages(sourcePdf, [i])
        newPdf.addPage(page)
        const pdfBytes = await newPdf.save()
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        splitResults.push({ url: URL.createObjectURL(blob), filename: `page_${i + 1}.pdf` })
        setProgress(((i + 1) / pageCount) * 100)
      }
      setResults(splitResults)
    } catch (error) { alert('Error splitting PDF') }
    finally { setProcessing(false) }
  }

  if (results.length > 0) return (
    <div className="card">
      <p className="text-green-400 mb-4">✓ PDF split into {results.length} pages!</p>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {results.map((result, index) => (
          <DownloadButton key={index} url={result.url} filename={result.filename} label={`Download Page ${index + 1}`} />
        ))}
      </div>
      <button onClick={() => { results.forEach(r => URL.revokeObjectURL(r.url)); setResults([]); setFile(null) }} className="btn-secondary w-full mt-3">Split Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(files) => setFile(files[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <p className="text-indigo-400 mt-4">📄 {file.name}</p>
          <button onClick={handleSplit} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Splitting...' : 'Split PDF'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default Split
