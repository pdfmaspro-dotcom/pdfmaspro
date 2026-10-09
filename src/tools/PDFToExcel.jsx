import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

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

// Y-position ke basis pe items ko rows mein group karta hai
function groupItemsIntoRows(items, yTolerance = 3) {
  const rowMap = {}
  for (const item of items) {
    const y = Math.round(item.transform[5])
    const existingY = Object.keys(rowMap).find(k => Math.abs(k - y) <= yTolerance)
    const key = existingY !== undefined ? existingY : y
    if (!rowMap[key]) rowMap[key] = []
    rowMap[key].push({ text: item.str, x: item.transform[4] })
  }
  // Y descending (top to bottom)
  return Object.keys(rowMap)
    .sort((a, b) => b - a)
    .map(y => rowMap[y].sort((a, b) => a.x - b.x).map(i => i.text.trim()).filter(Boolean))
    .filter(row => row.length > 0)
}

// Simple heuristic: row is a table row if it has multiple non-empty cells
function isTableRow(row) {
  return row.length >= 2
}

// Detect & group contiguous table blocks
function extractTables(allRows) {
  const tables = []
  let current = []
  for (const row of allRows) {
    if (isTableRow(row)) {
      current.push(row)
    } else {
      if (current.length >= 2) tables.push([...current])
      current = []
    }
  }
  if (current.length >= 2) tables.push(current)
  return tables
}

function PDFToExcel() {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [preview, setPreview] = useState(null)   // { tables, pageCount }
  const [mode, setMode] = useState('tables')      // 'tables' | 'fulltext'
  const [outputFmt, setOutputFmt] = useState('xlsx') // 'xlsx' | 'csv'

  const extract = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0); setResult(null); setPreview(null)
    try {
      setStatus('Loading PDF...')
      const buffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      setStatus('Loading Excel library...')
      const XLSX = await loadSheetJS()

      const wb = XLSX.utils.book_new()
      let totalTablesFound = 0

      if (mode === 'tables') {
        // Per-page table extraction
        for (let i = 1; i <= pdf.numPages; i++) {
          setStatus(`Scanning page ${i} of ${pdf.numPages} for tables...`)
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const rows = groupItemsIntoRows(content.items)
          const tables = extractTables(rows)

          tables.forEach((table, tIdx) => {
            totalTablesFound++
            // Normalize: pad all rows to same column count
            const maxCols = Math.max(...table.map(r => r.length))
            const normalized = table.map(r => {
              while (r.length < maxCols) r.push('')
              return r
            })
            const sheetName = `Page${i}_Table${tIdx + 1}`.substring(0, 31)
            const ws = XLSX.utils.aoa_to_sheet(normalized)
            XLSX.utils.book_append_sheet(wb, ws, sheetName)
          })

          setProgress(10 + (i / pdf.numPages) * 75)
        }

        // If no tables found, fallback to text
        if (totalTablesFound === 0) {
          setStatus('No tables found — extracting all text...')
          const allRows = []
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            const rows = groupItemsIntoRows(content.items)
            allRows.push([`--- Page ${i} ---`], ...rows)
          }
          const ws = XLSX.utils.aoa_to_sheet(allRows)
          XLSX.utils.book_append_sheet(wb, ws, 'All Text')
        }
      } else {
        // Full text mode — one sheet per page
        for (let i = 1; i <= pdf.numPages; i++) {
          setStatus(`Extracting page ${i} of ${pdf.numPages}...`)
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const rows = groupItemsIntoRows(content.items)
          const sheetName = `Page ${i}`.substring(0, 31)
          const ws = XLSX.utils.aoa_to_sheet(rows)
          XLSX.utils.book_append_sheet(wb, ws, sheetName)
          setProgress(10 + (i / pdf.numPages) * 75)
        }
      }

      setStatus('Generating file...')
      setProgress(90)

      const baseName = file.name.replace(/\.pdf$/i, '')

      if (outputFmt === 'xlsx') {
        const xlsxOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([xlsxOut], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        setResult({
          url: URL.createObjectURL(blob),
          filename: baseName + '.xlsx',
          sheets: wb.SheetNames.length,
          tables: totalTablesFound,
        })
      } else {
        // CSV — only first sheet
        const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]])
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
        setResult({
          url: URL.createObjectURL(blob),
          filename: baseName + '.csv',
          sheets: 1,
          tables: totalTablesFound,
        })
      }

      // Build preview from first sheet
      const firstSheet = wb.Sheets[wb.SheetNames[0]]
      const previewData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' })
      setPreview({ rows: previewData.slice(0, 12), sheetCount: wb.SheetNames.length, tableCount: totalTablesFound })
      setProgress(100); setStatus('')

    } catch (err) {
      alert('Error: ' + err.message)
      setStatus('')
    } finally { setProcessing(false) }
  }

  if (result) return (
    <div className="space-y-4">
      <div className="card text-center">
        <div className="text-5xl mb-3">✅</div>
        <p className="text-green-400 font-semibold mb-1">PDF converted successfully!</p>
        <div className="flex justify-center gap-4 text-sm text-gray-400 mb-4">
          <span>📊 {result.sheets} sheet{result.sheets !== 1 ? 's' : ''}</span>
          {result.tables > 0 && <span>📋 {result.tables} table{result.tables !== 1 ? 's' : ''} extracted</span>}
        </div>
        <DownloadButton url={result.url} filename={result.filename} />
        <button onClick={() => { setResult(null); setFile(null); setPreview(null) }}
          className="btn-secondary w-full mt-3">Convert Another PDF</button>
      </div>

      {preview && preview.rows.length > 0 && (
        <div className="card">
          <p className="text-sm font-medium mb-2 text-gray-300">Preview — First Sheet</p>
          <div className="border border-gray-700 rounded-lg overflow-auto max-h-52">
            <table className="text-xs w-full">
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i} className={i === 0 ? 'bg-indigo-900/30 font-semibold' : i % 2 === 0 ? 'bg-gray-900/40' : ''}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-2 py-1 border-r border-b border-gray-800 text-gray-300 whitespace-nowrap max-w-[140px] truncate">
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
    </div>
  )

  return (
    <div>
      <div className="mb-4 p-3 bg-indigo-900/20 border border-indigo-800/50 rounded-lg">
        <p className="text-xs text-indigo-300">
          📊 Extracts tables and text from PDF into Excel/CSV. Works best on PDFs with clearly structured tables (invoices, bank statements, reports).
          <br />⚠️ Scanned/image PDFs won't work — use the OCR PDF tool first to extract text.
        </p>
      </div>

      <FileUploader
        onFileSelect={(f) => { setFile(f[0]); setResult(null); setPreview(null) }}
        accept={{ 'application/pdf': ['.pdf'] }}
      />

      {file && (
        <div className="mt-6 space-y-4">
          {/* Extraction mode */}
          <div>
            <label className="block text-sm font-medium mb-2">Extraction Mode</label>
            <div className="flex gap-3">
              {[
                ['tables', '📋 Tables Only', 'Best for invoices, reports, statements'],
                ['fulltext', '📄 All Text', 'Extract everything, one sheet per page'],
              ].map(([val, label, desc]) => (
                <button key={val} onClick={() => setMode(val)}
                  className={`flex-1 py-3 px-3 rounded-lg border text-sm text-left transition-all ${mode === val ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                  <span className="block font-medium">{label}</span>
                  <span className="text-xs text-gray-500 mt-0.5 block">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Output format */}
          <div>
            <label className="block text-sm font-medium mb-2">Output Format</label>
            <div className="flex gap-3">
              {[
                ['xlsx', '📊 Excel (.xlsx)', 'Multiple sheets, better formatting'],
                ['csv',  '📄 CSV (.csv)',    'Single sheet, universal compatibility'],
              ].map(([val, label, desc]) => (
                <button key={val} onClick={() => setOutputFmt(val)}
                  className={`flex-1 py-3 px-3 rounded-lg border text-sm text-left transition-all ${outputFmt === val ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                  <span className="block font-medium">{label}</span>
                  <span className="text-xs text-gray-500 mt-0.5 block">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={extract} disabled={processing} className="btn-primary w-full py-3">
            {processing ? (status || 'Extracting...') : `Convert PDF to ${outputFmt.toUpperCase()}`}
          </button>
        </div>
      )}

      {processing && (
        <div className="mt-4">
          <ProgressBar progress={progress} />
          <p className="text-xs text-gray-400 text-center mt-2">{status}</p>
        </div>
      )}
    </div>
  )
}

export default PDFToExcel
