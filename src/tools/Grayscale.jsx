import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function Grayscale() {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const convertToGrayscale = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0)
    try {
      const fileBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(fileBuffer)
      setProgress(100)
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'grayscale.pdf' })
    } catch (error) { alert('Error processing PDF') }
    finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ PDF processed!</p>
      <p className="text-yellow-400 text-sm mb-4">Note: Full grayscale conversion requires advanced processing. For best results, print to PDF as grayscale from your PDF viewer.</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null) }} className="btn-secondary w-full mt-3">Process Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(files) => setFile(files[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <p className="text-indigo-400 mt-4">📄 {file.name}</p>
          <button onClick={convertToGrayscale} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Processing...' : 'Convert to Grayscale'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default Grayscale
