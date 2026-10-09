import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function ImagesToPDF() {
  const [images, setImages] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const handleConvert = async () => {
    if (!images || images.length === 0) { alert('Please select at least one image'); return }
    setProcessing(true); setProgress(0)
    try {
      const pdfDoc = await PDFDocument.create()
      for (let i = 0; i < images.length; i++) {
        const imageBuffer = await images[i].arrayBuffer()
        const imageType = images[i].type
        let image
        if (imageType === 'image/jpeg') image = await pdfDoc.embedJpg(imageBuffer)
        else if (imageType === 'image/png') image = await pdfDoc.embedPng(imageBuffer)
        else { alert(`Unsupported type: ${images[i].name}. Use JPG or PNG.`); setProcessing(false); return }
        const page = pdfDoc.addPage([image.width, image.height])
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
        setProgress(((i + 1) / images.length) * 100)
      }
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'combined_images.pdf' })
    } catch (error) { alert('Error converting images to PDF') }
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
      <FileUploader onFileSelect={setImages} accept={{ 'image/*': ['.jpg', '.jpeg', '.png'] }} multiple={true} label="Drag & drop JPG or PNG images here, or click to select" />
      {images.length > 0 && (
        <>
          <p className="text-indigo-400 mt-4">{images.length} images selected</p>
          <p className="text-gray-400 text-sm mt-1">Order: {images.map(img => img.name).join(', ')}</p>
          <button onClick={handleConvert} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Converting...' : 'Combine to PDF'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default ImagesToPDF
