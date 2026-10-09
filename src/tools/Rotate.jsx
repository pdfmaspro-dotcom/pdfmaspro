import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function Rotate() {
  const [file, setFile] = useState(null)
  const [rotation, setRotation] = useState(90)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const handleRotate = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0)
    try {
      const fileBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(fileBuffer)
      const pages = pdfDoc.getPages()
      for (let i = 0; i < pages.length; i++) {
        const currentRotation = pages[i].getRotation().angle
        pages[i].setRotation(currentRotation + rotation)
        setProgress(((i + 1) / pages.length) * 100)
      }
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'rotated.pdf' })
    } catch (error) { alert('Error rotating PDF') }
    finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ PDF rotated successfully!</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null) }} className="btn-secondary w-full mt-3">Rotate Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(files) => setFile(files[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Rotation angle</label>
            <select value={rotation} onChange={e => setRotation(parseInt(e.target.value))} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500">
              <option value={90}>90° clockwise</option>
              <option value={180}>180°</option>
              <option value={270}>270° clockwise (90° counter-clockwise)</option>
            </select>
          </div>
          <button onClick={handleRotate} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Rotating...' : 'Rotate PDF'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default Rotate
