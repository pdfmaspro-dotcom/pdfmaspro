import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function Compress() {
  const [file, setFile] = useState(null)
  const [quality, setQuality] = useState('medium')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState(null)

  const qualitySettings = {
    low:    { scale: 0.8, jpegQuality: 0.5, label: 'Low Quality (Max Compression)' },
    medium: { scale: 1.2, jpegQuality: 0.7, label: 'Medium Quality (Balanced)' },
    high:   { scale: 1.5, jpegQuality: 0.85, label: 'High Quality (Less Compression)' },
  }

  const compressPDF = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0); setStats(null)

    try {
      const originalSize = file.size
      const arrayBuffer = await file.arrayBuffer()
      const { scale, jpegQuality } = qualitySettings[quality]

      // Load PDF with pdfjs for rendering
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages

      // Create new PDF with pdf-lib
      const newPdfDoc = await PDFDocument.create()

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })

        // Render to canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({ canvasContext: ctx, viewport }).promise

        // Convert to JPEG (smaller than PNG)
        const jpegDataUrl = canvas.toDataURL('image/jpeg', jpegQuality)
        const jpegBase64 = jpegDataUrl.split(',')[1]
        const jpegBytes = Uint8Array.from(atob(jpegBase64), c => c.charCodeAt(0))

        // Embed in new PDF
        const jpegImage = await newPdfDoc.embedJpg(jpegBytes)
        const pdfPage = newPdfDoc.addPage([viewport.width, viewport.height])
        pdfPage.drawImage(jpegImage, {
          x: 0, y: 0,
          width: viewport.width,
          height: viewport.height,
        })

        setProgress((i / numPages) * 100)
      }

      const compressedBytes = await newPdfDoc.save()
      // If our result is not smaller, hand back the original instead of a bigger file
      const keptOriginal = compressedBytes.length >= originalSize
      const outBytes = keptOriginal ? new Uint8Array(arrayBuffer) : compressedBytes
      const outSize = outBytes.length
      const savedPercent = Math.round((1 - outSize / originalSize) * 100)

      const blob = new Blob([outBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: keptOriginal ? file.name : 'compressed.pdf' })
      setStats({
        original: (originalSize / 1024).toFixed(1),
        compressed: (outSize / 1024).toFixed(1),
        saved: savedPercent > 0 ? savedPercent : 0,
        keptOriginal,
      })
    } catch (error) {
      console.error(error)
      alert('Error compressing PDF: ' + error.message)
    } finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">{stats?.keptOriginal ? '✓ Done — your original file is returned unchanged' : '✓ PDF compressed successfully!'}</p>
      {stats?.keptOriginal && (
        <p className="text-yellow-300 text-sm mb-4">This method could not make your PDF smaller (text-heavy PDFs often do not shrink), so you get your original file back instead of a bigger one.</p>
      )}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Original</p>
            <p className="text-white font-bold">{stats.original} KB</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Compressed</p>
            <p className="text-white font-bold">{stats.compressed} KB</p>
          </div>
          <div className="bg-indigo-900/50 border border-indigo-500 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Saved</p>
            <p className="text-indigo-400 font-bold">{stats.saved}%</p>
          </div>
        </div>
      )}
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null); setStats(null) }} className="btn-secondary w-full mt-3">Compress Another</button>
    </div>
  )

  return (
    <div>
      <p className="text-xs text-gray-400 mb-4">How it works: each page is converted to an image and re-encoded at the quality you choose. This works best for scanned or image-heavy PDFs. In the compressed file, text can no longer be selected or searched.</p>
      <FileUploader onFileSelect={(files) => setFile(files[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <p className="text-indigo-400 mt-4">📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
          <div className="mt-6">
            <label className="block text-sm font-medium mb-3">Compression Level</label>
            <div className="space-y-3">
              {Object.entries(qualitySettings).map(([key, val]) => (
                <label key={key} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${quality === key ? 'border-indigo-500 bg-indigo-900/30' : 'border-gray-700 hover:border-gray-600'}`}>
                  <input type="radio" name="quality" value={key} checked={quality === key} onChange={() => setQuality(key)} className="accent-indigo-500" />
                  <span className="text-sm">{val.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
            <p className="text-blue-300 text-xs">ℹ️ Compression converts pages to optimized images. Text may lose selectability. For text-heavy documents, use Medium or High quality.</p>
          </div>
          <button onClick={compressPDF} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Compressing...' : 'Compress PDF'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default Compress
