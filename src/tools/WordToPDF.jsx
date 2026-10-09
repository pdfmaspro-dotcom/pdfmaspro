import React, { useState } from 'react'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function WordToPDF() {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleConvert = async () => {
    if (!file) { setError('Please select a .docx or .txt file'); return }
    setProcessing(true); setProgress(10); setError('')

    try {
      let text = ''

      if (file.name.endsWith('.txt')) {
        // Plain text — direct read
        text = await file.text()
        setProgress(40)
      } else if (file.name.endsWith('.docx')) {
        // DOCX — use mammoth to extract text
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        setProgress(30)
        const { value } = await mammoth.extractRawText({ arrayBuffer })
        text = value
        setProgress(50)
      } else {
        setError('Supported formats: .docx and .txt')
        setProcessing(false)
        return
      }

      // Create PDF with pdf-lib
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      setProgress(65)

      const pageWidth = 595.28   // A4
      const pageHeight = 841.89  // A4
      const margin = 60
      const contentWidth = pageWidth - margin * 2
      const fontSize = 11
      const lineHeight = fontSize * 1.5
      const titleFontSize = 16

      const lines = text.split('\n')
      let page = pdfDoc.addPage([pageWidth, pageHeight])
      let y = pageHeight - margin

      const drawLine = (lineText, fSize = fontSize, fFont = font, color = rgb(0.1, 0.1, 0.1)) => {
        // Word-wrap long lines
        const words = lineText.trim().split(' ')
        let currentLine = ''
        const wrappedLines = []

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word
          const textWidth = fFont.widthOfTextAtSize(testLine, fSize)
          if (textWidth > contentWidth && currentLine) {
            wrappedLines.push(currentLine)
            currentLine = word
          } else {
            currentLine = testLine
          }
        }
        if (currentLine) wrappedLines.push(currentLine)

        for (const wl of wrappedLines) {
          if (y < margin + lineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight])
            y = pageHeight - margin
          }
          page.drawText(wl, { x: margin, y, size: fSize, font: fFont, color })
          y -= fSize * 1.6
        }
      }

      // Render lines
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        // Detect headings (ALL CAPS or starts with # or short lines ending with :)
        const isHeading = (line.trim().length > 0 && line.trim().length < 60 &&
          (line === line.toUpperCase() || line.trim().startsWith('#') || line.trim().endsWith(':')))

        if (!line.trim()) {
          y -= lineHeight * 0.5 // blank line gap
        } else if (isHeading) {
          y -= 4 // extra space before heading
          drawLine(line.replace(/^#+\s*/, ''), titleFontSize, boldFont, rgb(0.24, 0.24, 0.87))
          y -= 4
        } else {
          drawLine(line)
        }

        if (i % 10 === 0) setProgress(65 + (i / lines.length) * 25)
      }

      // Add page numbers
      const pageCount = pdfDoc.getPageCount()
      for (let i = 0; i < pageCount; i++) {
        const pg = pdfDoc.getPages()[i]
        pg.drawText(`${i + 1} / ${pageCount}`, {
          x: pageWidth / 2 - 15, y: margin / 2,
          size: 9, font, color: rgb(0.6, 0.6, 0.6)
        })
      }

      setProgress(95)
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const baseName = file.name.replace(/\.(docx|txt)$/i, '')
      setResult({ url: URL.createObjectURL(blob), filename: `${baseName}.pdf` })
      setProgress(100)

    } catch (err) {
      console.error(err)
      setError(`Conversion failed: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  if (result) return (
    <div className="card text-center">
      <div className="text-5xl mb-3">✅</div>
      <p className="text-green-400 font-semibold mb-4">Converted successfully!</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null); setProgress(0) }}
        className="btn-secondary w-full mt-3">Convert Another</button>
    </div>
  )

  return (
    <div className="space-y-4">
      <FileUploader
        onFileSelect={f => { setFile(Array.isArray(f) ? f[0] : f); setError('') }}
        accept={{ 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] }}
        label="Drag & drop your .docx or .txt file here"
      />

      {file && (
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-900/40 flex items-center justify-center text-blue-400">W</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {processing && <ProgressBar progress={progress} />}

      <button onClick={handleConvert} disabled={!file || processing} className="btn-primary w-full py-3">
        {processing ? 'Converting...' : 'Convert to PDF'}
      </button>

      <div className="card bg-indigo-900/20 border-indigo-800">
        <p className="text-sm text-indigo-300 font-medium mb-2">ℹ️ Supported formats:</p>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• <strong>.docx</strong> — Microsoft Word documents (text extraction)</li>
          <li>• <strong>.txt</strong> — Plain text files with full formatting</li>
          <li>• Headings, paragraphs, page numbers automatically added</li>
          <li>• Output: A4 sized PDF</li>
        </ul>
      </div>
    </div>
  )
}

export default WordToPDF
