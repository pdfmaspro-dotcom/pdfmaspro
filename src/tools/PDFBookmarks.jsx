import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function PDFBookmarks() {
  const [file, setFile] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [bookmarks, setBookmarks] = useState([{ title: 'Introduction', page: 1 }])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const loadFile = async (files) => {
    const f = files[0]; setFile(f)
    const buffer = await f.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    setTotalPages(pdf.numPages)
  }

  const addBookmark = () => setBookmarks(prev => [...prev, { title: '', page: 1 }])
  const removeBookmark = (i) => setBookmarks(prev => prev.filter((_, idx) => idx !== i))
  const updateBookmark = (i, field, val) => setBookmarks(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: val } : b))

  const applyBookmarks = async () => {
    if (!file) return
    if (bookmarks.some(b => !b.title.trim())) { alert('All bookmarks need a title'); return }
    setProcessing(true); setProgress(0)
    try {
      const buffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      const pages = pdfDoc.getPages()

      bookmarks.forEach(bm => {
        const pageIdx = Math.max(0, Math.min(Number(bm.page) - 1, pages.length - 1))
        pdfDoc.addNamedDestination(bm.title, { page: pages[pageIdx], fit: 'FitPage' })
      })

      setProgress(80)
      const pdfBytes = await pdfDoc.save()
      setProgress(100)
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'bookmarked.pdf' })
    } catch (err) {
      alert('Error: ' + err.message)
    } finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ Bookmarks added successfully!</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null); setTotalPages(0) }} className="btn-secondary w-full mt-3">Process Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={loadFile} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium">Bookmarks ({totalPages} pages total)</label>
              <button onClick={addBookmark} className="text-xs btn-secondary px-3 py-1">+ Add Bookmark</button>
            </div>
            <div className="space-y-2">
              {bookmarks.map((bm, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="text" value={bm.title} onChange={e => updateBookmark(i, 'title', e.target.value)}
                    placeholder="Bookmark title"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Pg</span>
                    <input type="number" value={bm.page} min="1" max={totalPages || 999}
                      onChange={e => updateBookmark(i, 'page', e.target.value)}
                      className="w-16 px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <button onClick={() => removeBookmark(i)} className="text-red-400 hover:text-red-300 text-lg px-1">×</button>
                </div>
              ))}
            </div>
          </div>
          <button onClick={applyBookmarks} disabled={processing || bookmarks.length === 0} className="btn-primary w-full mt-4">
            {processing ? 'Adding Bookmarks...' : `Add ${bookmarks.length} Bookmark(s)`}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default PDFBookmarks
