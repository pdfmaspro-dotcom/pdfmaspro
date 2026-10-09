import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function DeletePages() {
  const [file, setFile] = useState(null)
  const [pagesToDelete, setPagesToDelete] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const handleDelete = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    const deletePages = pagesToDelete.split(',').map(p => parseInt(p.trim()) - 1).filter(p => !isNaN(p))
    if (deletePages.length === 0) { alert('Please enter valid page numbers to delete'); return }
    setProcessing(true); setProgress(0)
    try {
      const fileBuffer = await file.arrayBuffer()
      const sourcePdf = await PDFDocument.load(fileBuffer)
      const totalPages = sourcePdf.getPageCount()
      const keepPages = []
      for (let i = 0; i < totalPages; i++) {
        if (!deletePages.includes(i)) keepPages.push(i)
        setProgress((i / totalPages) * 100)
      }
      const newPdf = await PDFDocument.create()
      const pages = await newPdf.copyPages(sourcePdf, keepPages)
      pages.forEach(page => newPdf.addPage(page))
      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'deleted_pages.pdf' })
    } catch (error) { alert('Error deleting pages') }
    finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ Pages deleted successfully!</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null); setPagesToDelete('') }} className="btn-secondary w-full mt-3">Delete Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(files) => setFile(files[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Pages to delete (comma-separated)</label>
            <input type="text" value={pagesToDelete} onChange={e => setPagesToDelete(e.target.value)} placeholder="e.g., 1,3,5" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500" />
          </div>
          <button onClick={handleDelete} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Deleting...' : 'Delete Pages'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default DeletePages
