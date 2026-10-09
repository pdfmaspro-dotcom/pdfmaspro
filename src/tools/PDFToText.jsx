import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function PDFToText() {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [text, setText] = useState('')

  const extractText = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages
      let fullText = ''
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map(item => item.str).join(' ')
        fullText += `\n\n--- Page ${i} ---\n\n${pageText}`
        setProgress((i / numPages) * 100)
      }
      setText(fullText)
    } catch (error) { alert('Error extracting text from PDF') }
    finally { setProcessing(false) }
  }

  const downloadText = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'extracted_text.txt'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (text) return (
    <div className="card">
      <p className="text-green-400 mb-4">✓ Text extracted successfully!</p>
      <button onClick={downloadText} className="btn-primary w-full mb-4">⬇️ Download as TXT</button>
      <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap">{text}</pre>
      </div>
      <button onClick={() => { setText(''); setFile(null) }} className="btn-secondary w-full mt-3">Extract Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(files) => setFile(files[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <p className="text-indigo-400 mt-4">📄 {file.name}</p>
          <button onClick={extractText} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Extracting...' : 'Extract Text'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default PDFToText
