import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function PDFToPNG() {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [images, setImages] = useState([])

  const convertToPNG = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0); setImages([])
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages
      const downloadedImages = []
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2.0 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width
        await page.render({ canvasContext: context, viewport }).promise
        downloadedImages.push({ url: canvas.toDataURL('image/png'), filename: `page_${i}.png` })
        setProgress((i / numPages) * 100)
      }
      setImages(downloadedImages)
    } catch (error) { alert('Error converting PDF to PNG') }
    finally { setProcessing(false) }
  }

  if (images.length > 0) return (
    <div className="card">
      <p className="text-green-400 mb-4">✓ Converted {images.length} pages to PNG!</p>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {images.map((image, index) => (
          <a key={index} href={image.url} download={image.filename} className="btn-secondary w-full block text-center mb-2">
            ⬇️ Download Page {index + 1} as PNG
          </a>
        ))}
      </div>
      <button onClick={() => { images.forEach(img => URL.revokeObjectURL(img.url)); setImages([]); setFile(null) }} className="btn-secondary w-full mt-3">Convert Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(files) => setFile(files[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <p className="text-indigo-400 mt-4">📄 {file.name}</p>
          <button onClick={convertToPNG} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Converting...' : 'Convert to PNG'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default PDFToPNG
