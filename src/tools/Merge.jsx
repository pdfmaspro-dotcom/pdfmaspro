import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function Merge() {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const handleMerge = async () => {
    if (!files || files.length < 2) { alert('Please select at least 2 PDF files to merge'); return }
    setProcessing(true); setProgress(0)
    try {
      const mergedPdf = await PDFDocument.create()
      for (let i = 0; i < files.length; i++) {
        const fileBuffer = await files[i].arrayBuffer()
        const pdf = await PDFDocument.load(fileBuffer)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(page => mergedPdf.addPage(page))
        setProgress(((i + 1) / files.length) * 100)
      }
      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'merged.pdf' })
    } catch (error) { alert('Error merging PDFs') }
    finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ PDF merged successfully!</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFiles([]) }} className="btn-secondary w-full mt-3">Merge Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={setFiles} accept={{ 'application/pdf': ['.pdf'] }} multiple={true} label="Drag & drop multiple PDF files here, or click to select" />
      {files.length > 0 && (
        <>
          <p className="text-indigo-400 mt-4">{files.length} files selected</p>
          <button onClick={handleMerge} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Merging...' : 'Merge PDFs'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default Merge
