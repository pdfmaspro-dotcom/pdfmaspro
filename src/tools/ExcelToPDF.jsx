import React, { useState } from 'react'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

// SheetJS CDN se load hoga
function loadSheetJS() {
  return new Promise((resolve, reject) => {
    if (window.XLSX) { resolve(window.XLSX); return }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
    script.onload = () => resolve(window.XLSX)
    script.onerror = () => reject(new Error('SheetJS load failed'))
    document.head.appendChild(script)
  })
}

const PAGE_SIZES = {
  A4:     { w: 595.28, h: 841.89 },
  Letter: { w: 612,    h: 792 },
  A3:     { w: 841.89, h: 1190.55 },
}

function ExcelToPDF() {
  const [file, setFile] = useState(null)
  const [sheets, setSheets] = useState([])
  const [selectedSheet, setSelectedSheet] = useState('')
  const [pageSize, setPageSize] = useState('A4')
  const [orientation, setOrientation] = useState('landscape')
  const [fontSize, setFontSize] = useState(8)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [preview, setPreview] = useState(null)

  const handleFile = async (files) => {
    const f = files[0]
    setFile(f); setResult(null); setPreview(null); setSheets([])
    try {
      setStatus('Reading Excel file...')
      const XLSX = await loadSheetJS()
      const buffer = await f.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      setSheets(wb.SheetNames)
      setSelectedSheet(wb.SheetNames[0])
      // Preview first sheet
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      setPreview(data.slice(0, 10))
      setStatus('')
    } catch (err) {
      setStatus('Error reading file: ' + err.message)
    }
  }

  const convert = async () => {
    if (!file || !selectedSheet) return
    setProcessing(true); setProgress(10); setStatus('Loading libraries...')
    try {
      const XLSX = await loadSheetJS()
      setStatus('Reading sheet data...')
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[selectedSheet]
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (!data || data.length === 0) { alert('Sheet is empty'); setProcessing(false); return }

      setProgress(30); setStatus('Building PDF...')
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      let { w, h } = PAGE_SIZES[pageSize]
      if (orientation === 'landscape') [w, h] = [h, w]

      const MARGIN = 30
      const CELL_PAD = 4
      const LINE_HEIGHT = fontSize + CELL_PAD * 2
      const usableW = w - MARGIN * 2
      const usableH = h - MARGIN * 2

      // Calculate max cols that fit
      const maxCols = data[0] ? data[0].length : 1
      const colW = Math.floor(usableW / maxCols)

      // Split rows into pages
      const rowsPerPage = Math.floor(usableH / LINE_HEIGHT)
      const totalPages = Math.ceil(data.length / rowsPerPage)

      for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        const page = pdfDoc.addPage([w, h])
        const rowStart = pageIdx * rowsPerPage
        const rowEnd = Math.min(rowStart + rowsPerPage, data.length)

        for (let rowIdx = rowStart; rowIdx < rowEnd; rowIdx++) {
          const row = data[rowIdx]
          const isHeader = rowIdx === 0
          const y = h - MARGIN - (rowIdx - rowStart + 1) * LINE_HEIGHT

          // Row background for header
          if (isHeader) {
            page.drawRectangle({
              x: MARGIN, y: y - CELL_PAD,
              width: usableW, height: LINE_HEIGHT,
              color: rgb(0.23, 0.27, 0.66),
            })
          } else if ((rowIdx - rowStart) % 2 === 0) {
            page.drawRectangle({
              x: MARGIN, y: y - CELL_PAD,
              width: usableW, height: LINE_HEIGHT,
              color: rgb(0.95, 0.95, 0.97),
            })
          }

          // Cell borders + text
          for (let colIdx = 0; colIdx < maxCols; colIdx++) {
            const x = MARGIN + colIdx * colW
            const cellVal = String(row[colIdx] ?? '').substring(0, Math.floor(colW / (fontSize * 0.5)))

            // Vertical border
            page.drawLine({
              start: { x, y: y - CELL_PAD },
              end:   { x, y: y - CELL_PAD + LINE_HEIGHT },
              thickness: 0.3, color: rgb(0.8, 0.8, 0.8),
            })

            page.drawText(cellVal, {
              x: x + CELL_PAD, y: y,
              size: fontSize,
              font: isHeader ? boldFont : font,
              color: isHeader ? rgb(1, 1, 1) : rgb(0.1, 0.1, 0.1),
              maxWidth: colW - CELL_PAD * 2,
            })
          }

          // Bottom border
          page.drawLine({
            start: { x: MARGIN, y: y - CELL_PAD },
            end:   { x: MARGIN + usableW, y: y - CELL_PAD },
            thickness: 0.3, color: rgb(0.8, 0.8, 0.8),
          })
        }

        // Page number
        page.drawText(`Page ${pageIdx + 1} of ${totalPages} — ${selectedSheet}`, {
          x: MARGIN, y: 12, size: 7, font, color: rgb(0.5, 0.5, 0.5),
        })

        setProgress(30 + ((pageIdx + 1) / totalPages) * 60)
      }

      setProgress(95); setStatus('Saving PDF...')
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const fname = file.name.replace(/\.(xlsx?|csv)$/i, '') + '-' + selectedSheet + '.pdf'
      setResult({ url: URL.createObjectURL(blob), filename: fname })
      setProgress(100); setStatus('')
    } catch (err) {
      alert('Conversion error: ' + err.message)
      setStatus('')
    } finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <div className="text-5xl mb-3">✅</div>
      <p className="text-green-400 font-semibold mb-1">Excel converted to PDF!</p>
      <p className="text-gray-400 text-sm mb-4">Sheet: <span className="text-white">{selectedSheet}</span></p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null); setSheets([]); setPreview(null) }}
        className="btn-secondary w-full mt-3">Convert Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader
        onFileSelect={handleFile}
        accept={{ 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                  'application/vnd.ms-excel': ['.xls'],
                  'text/csv': ['.csv'] }}
        label="Drag & drop Excel (.xlsx, .xls) or CSV file here"
      />

      {status && !processing && (
        <p className="text-indigo-400 text-sm mt-2">{status}</p>
      )}

      {sheets.length > 0 && (
        <div className="mt-6 space-y-4">
          {/* Sheet selector */}
          {sheets.length > 1 && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Sheet ({sheets.length} sheets found)</label>
              <div className="flex flex-wrap gap-2">
                {sheets.map(s => (
                  <button key={s} onClick={() => setSelectedSheet(s)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${selectedSheet === s ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                    📊 {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {preview && preview.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Data Preview (first 10 rows)</label>
              <div className="border border-gray-700 rounded-lg overflow-auto max-h-44">
                <table className="text-xs w-full">
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className={i === 0 ? 'bg-indigo-900/40 font-semibold' : i % 2 === 0 ? 'bg-gray-900/40' : ''}>
                        {row.map((cell, j) => (
                          <td key={j} className="px-2 py-1 border-r border-b border-gray-800 text-gray-300 whitespace-nowrap max-w-[120px] truncate">
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Page Size</label>
              <div className="flex gap-2">
                {Object.keys(PAGE_SIZES).map(p => (
                  <button key={p} onClick={() => setPageSize(p)}
                    className={`flex-1 py-2 rounded-lg border text-sm transition-all ${pageSize === p ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Orientation</label>
              <div className="flex gap-2">
                {['portrait', 'landscape'].map(o => (
                  <button key={o} onClick={() => setOrientation(o)}
                    className={`flex-1 py-2 rounded-lg border text-sm capitalize transition-all ${orientation === o ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                    {o === 'portrait' ? '📄' : '🖥️'} {o}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Font Size: {fontSize}px</label>
            <input type="range" min="6" max="12" step="1" value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))} className="w-full" />
            <p className="text-xs text-gray-500 mt-1">Smaller font = more data fits per page. Recommended: 7–9px for wide tables.</p>
          </div>

          <button onClick={convert} disabled={processing} className="btn-primary w-full">
            {processing ? (status || 'Converting...') : `Convert "${selectedSheet}" to PDF`}
          </button>
        </div>
      )}

      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default ExcelToPDF
