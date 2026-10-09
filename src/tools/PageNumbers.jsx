import React, { useState } from 'react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function PageNumbers() {
  const [file, setFile] = useState(null)
  const [startNumber, setStartNumber] = useState(1)
  const [position, setPosition] = useState('bottom-center')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const addPageNumbers = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0)
    try {
      const fileBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(fileBuffer)
      const pages = pdfDoc.getPages()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const pageNumber = startNumber + i
        let x, y
        switch (position) {
          case 'bottom-center': x = width / 2 - 20; y = 30; break
          case 'bottom-right': x = width - 60; y = 30; break
          case 'top-center': x = width / 2 - 20; y = height - 50; break
          case 'top-right': x = width - 60; y = height - 50; break
          default: x = width / 2 - 20; y = 30
        }
        page.drawText(pageNumber.toString(), { x, y, size: 12, font, color: rgb(0, 0, 0) })
        setProgress(((i + 1) / pages.length) * 100)
      }
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'numbered.pdf' })
    } catch (error) { alert('Error adding page numbers') }
    finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ Page numbers added successfully!</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null) }} className="btn-secondary w-full mt-3">Add to Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(files) => setFile(files[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Starting Number</label>
              <input type="number" min="1" value={startNumber} onChange={e => setStartNumber(parseInt(e.target.value))} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <select value={position} onChange={e => setPosition(e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500">
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
              </select>
            </div>
          </div>
          <button onClick={addPageNumbers} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Adding Page Numbers...' : 'Add Page Numbers'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default PageNumbers
