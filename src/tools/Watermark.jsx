import React, { useState } from 'react'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function Watermark() {
  const [file, setFile] = useState(null)
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL')
  const [opacity, setOpacity] = useState(0.3)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const addWatermark = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0)
    try {
      const fileBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true })
      const pages = pdfDoc.getPages()
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const textWidth = font.widthOfTextAtSize(watermarkText, 48)
        page.drawText(watermarkText, {
          x: (width - textWidth) / 2,
          y: height / 2,
          size: 48,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: opacity,
          rotate: degrees(45),
        })
        setProgress(((i + 1) / pages.length) * 100)
      }
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'watermarked.pdf' })
    } catch (error) {
      console.error(error)
      alert('Error adding watermark: ' + error.message)
    } finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ Watermark added successfully!</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null) }} className="btn-secondary w-full mt-3">Add Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(files) => setFile(files[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Watermark Text</label>
              <input type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Opacity: {opacity}</label>
              <input type="range" min="0.1" max="1" step="0.05" value={opacity}
                onChange={e => setOpacity(parseFloat(e.target.value))} className="w-full" />
            </div>
          </div>
          <button onClick={addWatermark} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Adding Watermark...' : 'Add Watermark'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default Watermark
