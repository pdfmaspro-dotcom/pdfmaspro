import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function PDFThumbnail() {
  const [file, setFile] = useState(null)
  const [thumbnails, setThumbnails] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [scale, setScale] = useState(1.0)
  const [generated, setGenerated] = useState(false)

  const generate = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0); setThumbnails([]); setGenerated(false)
    try {
      const buffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      const thumbs = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
        thumbs.push({ url: canvas.toDataURL('image/jpeg', 0.85), page: i })
        setProgress((i / pdf.numPages) * 100)
      }
      setThumbnails(thumbs)
      setGenerated(true)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally { setProcessing(false) }
  }

  const downloadAll = () => {
    thumbnails.forEach((t) => {
      const a = document.createElement('a')
      a.href = t.url
      a.download = `page-${t.page}.jpg`
      a.click()
    })
  }

  return (
    <div>
      <FileUploader onFileSelect={(f) => { setFile(f[0]); setThumbnails([]); setGenerated(false) }}
        accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Preview Quality: {scale}x</label>
            <input type="range" min="0.5" max="2" step="0.5" value={scale}
              onChange={e => setScale(Number(e.target.value))} className="w-full" />
            <p className="text-xs text-gray-500 mt-1">Higher quality = bigger file size per image</p>
          </div>
          <button onClick={generate} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Generating Thumbnails...' : 'Generate Thumbnails'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
      {generated && thumbnails.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{thumbnails.length} page thumbnails</h3>
            <button onClick={downloadAll} className="btn-primary text-sm px-4 py-2">⬇️ Download All</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {thumbnails.map(t => (
              <div key={t.page} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <img src={t.url} alt={`Page ${t.page}`} className="w-full" />
                <div className="flex justify-between items-center px-2 py-1.5">
                  <span className="text-xs text-gray-400">Page {t.page}</span>
                  <a href={t.url} download={`page-${t.page}.jpg`}
                    className="text-xs text-indigo-400 hover:text-indigo-300">⬇️</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PDFThumbnail
