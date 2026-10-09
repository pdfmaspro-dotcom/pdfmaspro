import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function JPGToPDF() {
  const [images, setImages] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const handleConvert = async () => {
    if (!images || images.length === 0) { alert('Please select at least one JPG image'); return }
    setProcessing(true); setProgress(0)
    try {
      const pdfDoc = await PDFDocument.create()
      for (let i = 0; i < images.length; i++) {
        const imageBuffer = await images[i].arrayBuffer()
        const image = await pdfDoc.embedJpg(imageBuffer)
        const page = pdfDoc.addPage([image.width, image.height])
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
        setProgress(((i + 1) / images.length) * 100)
      }
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'converted.pdf' })
    } catch (error) { alert('Error converting images to PDF. Ensure files are valid JPGs.') }
    finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ Converted {images.length} images to PDF!</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setImages([]) }} className="btn-secondary w-full mt-3">Convert Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={setImages} accept={{ 'image/jpeg': ['.jpg', '.jpeg'] }} multiple={true} label="Drag & drop JPG images here, or click to select" />
      {images.length > 0 && (
        <>
          <p className="text-indigo-400 mt-4">{images.length} images selected</p>
          <button onClick={handleConvert} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Converting...' : 'Convert to PDF'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default JPGToPDF
