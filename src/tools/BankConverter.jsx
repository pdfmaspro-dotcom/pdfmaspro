import React, { useState, useMemo } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FileUploader from '../components/FileUploader'
import { cleanAmount } from '../utils/cleanAmount'
import ProgressBar from '../components/ProgressBar'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseDate(str) {
  if (!str) return null
  // DD/MM/YYYY  DD-MM-YYYY  DD MMM YYYY  YYYY-MM-DD
  const patterns = [
    { re: /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/, fn: m => `${m[3]}-${m[2]}-${m[1]}` },
    { re: /(\d{4})[\/\-](\d{2})[\/\-](\d{2})/, fn: m => `${m[1]}-${m[2]}-${m[3]}` },
    { re: /(\d{2})\s([A-Za-z]{3})\s(\d{4})/, fn: m => {
      const months = {jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',
                      jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'}
      return `${m[3]}-${months[m[2].toLowerCase()]||'01'}-${m[1]}`
    }},
  ]
  for (const { re, fn } of patterns) {
    const m = str.match(re)
    if (m) return fn(m)
  }
  return null
}

function detectBank(text) {
  const t = text.toLowerCase()
  if (t.includes('state bank of india') || t.includes('sbi')) return 'SBI'
  if (t.includes('hdfc')) return 'HDFC'
  if (t.includes('icici')) return 'ICICI'
  if (t.includes('axis bank') || t.includes('axis ')) return 'Axis Bank'
  if (t.includes('kotak')) return 'Kotak'
  if (t.includes('punjab national') || t.includes('pnb')) return 'PNB'
  if (t.includes('bank of baroda') || t.includes('bob')) return 'Bank of Baroda'
  if (t.includes('canara')) return 'Canara Bank'
  if (t.includes('union bank')) return 'Union Bank'
  if (t.includes('yes bank')) return 'Yes Bank'
  if (t.includes('indusind')) return 'IndusInd'
  if (t.includes('idfc')) return 'IDFC'
  return 'Auto-Detected'
}

// Smart transaction parser – works across Indian bank formats
function parseTransactions(lines) {
  const dateRe = /\b(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}[\/\-]\d{2}|\d{2}\s[A-Za-z]{3}\s\d{4})\b/
  const amtRe  = /[\d,]+\.\d{2}/g

  const txns = []
  let sno = 1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.length < 10) continue

    const dateMatch = line.match(dateRe)
    if (!dateMatch) continue

    const amounts = [...(line.matchAll(amtRe))].map(m => cleanAmount(m[0])).filter(Boolean)
    if (amounts.length === 0) continue

    // Build description: take rest of line after date
    let desc = line.replace(dateMatch[0], '').trim()
    // Strip trailing numbers that look like amounts
    amounts.forEach(a => { desc = desc.replace(a.toLocaleString('en-IN', {minimumFractionDigits:2}), '').replace(a.toString(), '') })
    desc = desc.replace(/[\s,]+/g, ' ').trim()
    if (!desc || desc.length < 2) {
      // Try next line for description
      if (i + 1 < lines.length && lines[i+1] && !lines[i+1].match(dateRe)) {
        desc = lines[i+1].trim().substring(0, 80)
      }
    }

    // Figure out debit / credit / balance from amounts
    let debit = null, credit = null, balance = null
    if (amounts.length === 1) {
      // Just one amount – classify by line keywords
      const lower = line.toLowerCase()
      if (lower.includes('cr') || lower.includes('credit') || lower.includes('deposit') || lower.includes('received')) {
        credit = amounts[0]
      } else {
        debit = amounts[0]
      }
    } else if (amounts.length === 2) {
      // debit/credit + balance, or credit + balance
      debit   = amounts[0] > 0 ? amounts[0] : null
      balance = amounts[1]
    } else if (amounts.length >= 3) {
      // Most common: debit | credit | balance  OR  0 | credit | balance
      if (amounts[0] === 0 || amounts[0] < 0.01) {
        credit  = amounts[1]
        balance = amounts[2]
      } else {
        debit   = amounts[0]
        credit  = amounts[1] > 0 && amounts[1] !== amounts[0] ? amounts[1] : null
        balance = amounts[amounts.length - 1]
        if (credit && credit === balance) { credit = null }
      }
    }

    // Detect credit from description if debit/credit ambiguous
    const lower = line.toLowerCase()
    if (!credit && (lower.includes('cr') || lower.includes('credit') || lower.includes('neft cr') || lower.includes('imps cr') || lower.includes('upi cr'))) {
      credit = debit; debit = null
    }

    txns.push({
      sno: sno++,
      date: parseDate(dateMatch[0]) || dateMatch[0],
      dateRaw: dateMatch[0],
      description: desc || 'N/A',
      debit,
      credit,
      balance,
      type: credit ? 'Credit' : 'Debit',
    })
  }
  return txns
}

// ─── CSV / Excel Export ──────────────────────────────────────────────────────

function toCSV(txns) {
  const headers = ['S.No','Date','Description','Type','Debit','Credit','Balance']
  const rows = txns.map(t => [
    t.sno, t.dateRaw, `"${t.description.replace(/"/g,'""')}"`,
    t.type, t.debit||'', t.credit||'', t.balance||''
  ])
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

// Minimal XLSX generation (no extra library needed)
function toXLSX(txns) {
  // We'll generate a CSV with BOM for Excel compatibility
  const bom = '\uFEFF'
  return bom + toCSV(txns)
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Main Component ──────────────────────────────────────────────────────────

function BankConverter() {
  const [file,        setFile]        = useState(null)
  const [processing,  setProcessing]  = useState(false)
  const [progress,    setProgress]    = useState(0)
  const [transactions,setTransactions]= useState([])
  const [bankName,    setBankName]    = useState('')
  const [error,       setError]       = useState('')
  const [search,      setSearch]      = useState('')
  const [filterType,  setFilterType]  = useState('All')      // All / Debit / Credit
  const [dateFrom,    setDateFrom]    = useState('')
  const [dateTo,      setDateTo]      = useState('')
  const [amtMin,      setAmtMin]      = useState('')
  const [amtMax,      setAmtMax]      = useState('')

  // ── Extract & Parse ──────────────────────────────────────────────────────
  const handleConvert = async () => {
    if (!file) { alert('Please select a PDF bank statement'); return }
    setProcessing(true); setProgress(0); setTransactions([]); setError('')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages
      let fullText = ''
      const allLines = []

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        // Group items by y-position to reconstruct lines
        const byY = {}
        content.items.forEach(item => {
          const y = Math.round(item.transform[5])
          byY[y] = byY[y] ? byY[y] + ' ' + item.str : item.str
        })
        const pageLines = Object.keys(byY).sort((a,b)=>b-a).map(y=>byY[y])
        allLines.push(...pageLines)
        fullText += pageLines.join('\n') + '\n'
        setProgress((i / numPages) * 80)
      }

      // Detect bank
      const detected = detectBank(fullText)
      setBankName(detected)

      // Parse transactions
      setProgress(85)
      const txns = parseTransactions(allLines)
      setProgress(100)

      if (txns.length === 0) {
        setError('No transactions found. This PDF may be scanned/image-based or have an unsupported format. Try a text-based PDF bank statement.')
      } else {
        setTransactions(txns)
      }
    } catch (err) {
      console.error(err)
      setError('Error reading PDF: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  // ── Filtered Transactions ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      // Search
      if (search && !t.description.toLowerCase().includes(search.toLowerCase()) &&
          !t.dateRaw.includes(search)) return false
      // Type
      if (filterType !== 'All' && t.type !== filterType) return false
      // Date range
      if (dateFrom && t.date < dateFrom) return false
      if (dateTo   && t.date > dateTo)   return false
      // Amount range
      const amt = t.debit || t.credit || 0
      if (amtMin && amt < parseFloat(amtMin)) return false
      if (amtMax && amt > parseFloat(amtMax)) return false
      return true
    })
  }, [transactions, search, filterType, dateFrom, dateTo, amtMin, amtMax])

  // ── Summary ──────────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const totalDebit  = filtered.reduce((s,t) => s + (t.debit  || 0), 0)
    const totalCredit = filtered.reduce((s,t) => s + (t.credit || 0), 0)
    const lastBalance = filtered.length ? filtered[filtered.length-1].balance : null
    return { totalDebit, totalCredit, net: totalCredit - totalDebit, lastBalance }
  }, [filtered])

  const fmt = n => n == null ? '—' : '₹' + n.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})

  // ── Reset ────────────────────────────────────────────────────────────────
  const reset = () => {
    setFile(null); setTransactions([]); setBankName(''); setError('')
    setSearch(''); setFilterType('All'); setDateFrom(''); setDateTo('')
    setAmtMin(''); setAmtMax('')
  }

  // ── UI: Upload Screen ────────────────────────────────────────────────────
  if (transactions.length === 0 && !processing) {
    return (
      <div>
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-xl">
          <p className="text-blue-300 text-sm font-semibold mb-1">✅ Supported Banks</p>
          <p className="text-blue-200 text-sm">SBI · HDFC · ICICI · Axis · Kotak · PNB · Bank of Baroda · Canara · Union · Yes · IndusInd · IDFC · and more</p>
          <p className="text-yellow-300 text-xs mt-2">⚠️ Only text-based PDFs work (not scanned/image PDFs)</p>
        </div>

        <FileUploader
          onFileSelect={files => { setFile(files[0]); setError('') }}
          accept={{ 'application/pdf': ['.pdf'] }}
          label="Drag & drop your bank statement PDF here"
        />

        {file && (
          <div className="mt-4">
            <p className="text-indigo-400">📄 {file.name} ({(file.size/1024).toFixed(1)} KB)</p>
            <button onClick={handleConvert} className="btn-primary w-full mt-4">
              🔄 Convert Bank Statement
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-xl">
            <p className="text-red-400 text-sm">❌ {error}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
          <p className="text-gray-300 text-sm font-semibold mb-2">📋 How it works:</p>
          <ol className="text-gray-400 text-sm space-y-1 list-decimal list-inside">
            <li>Download bank statement as PDF from net banking</li>
            <li>Upload the PDF here</li>
            <li>Preview transactions in table</li>
            <li>Filter, search, analyze</li>
            <li>Download as CSV or Excel</li>
          </ol>
        </div>
      </div>
    )
  }

  if (processing) {
    return (
      <div>
        <p className="text-indigo-400 mb-4">📄 {file?.name}</p>
        <p className="text-gray-300 mb-4">Extracting transactions from your bank statement...</p>
        <ProgressBar progress={progress} />
      </div>
    )
  }

  // ── UI: Results Screen ───────────────────────────────────────────────────
  return (
    <div>
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs bg-indigo-900/50 text-indigo-300 px-3 py-1 rounded-full mr-2">🏦 {bankName}</span>
          <span className="text-xs bg-green-900/50 text-green-300 px-3 py-1 rounded-full">{transactions.length} transactions found</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadFile(toCSV(filtered), 'bank_statement.csv', 'text/csv')}
            className="btn-secondary text-sm px-3 py-1">⬇️ CSV</button>
          <button onClick={() => downloadFile(toXLSX(filtered), 'bank_statement.xlsx', 'application/vnd.ms-excel')}
            className="btn-primary text-sm px-3 py-1">📊 Excel</button>
          <button onClick={reset} className="btn-secondary text-sm px-3 py-1">🔄 New</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-3 text-center">
          <p className="text-xs text-red-400 mb-1">Total Debit</p>
          <p className="text-red-300 font-bold text-sm">{fmt(summary.totalDebit)}</p>
        </div>
        <div className="bg-green-900/20 border border-green-800 rounded-xl p-3 text-center">
          <p className="text-xs text-green-400 mb-1">Total Credit</p>
          <p className="text-green-300 font-bold text-sm">{fmt(summary.totalCredit)}</p>
        </div>
        <div className={`${summary.net >= 0 ? 'bg-blue-900/20 border-blue-800' : 'bg-orange-900/20 border-orange-800'} border rounded-xl p-3 text-center`}>
          <p className="text-xs text-blue-400 mb-1">Net Flow</p>
          <p className={`font-bold text-sm ${summary.net >= 0 ? 'text-blue-300' : 'text-orange-300'}`}>{fmt(summary.net)}</p>
        </div>
        <div className="bg-purple-900/20 border border-purple-800 rounded-xl p-3 text-center">
          <p className="text-xs text-purple-400 mb-1">Closing Balance</p>
          <p className="text-purple-300 font-bold text-sm">{fmt(summary.lastBalance)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4">
        <p className="text-sm font-semibold mb-3">🔍 Filter & Search</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Search */}
          <input type="text" placeholder="Search description..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="col-span-2 md:col-span-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />

          {/* Type */}
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500">
            <option value="All">All Transactions</option>
            <option value="Credit">Credits Only</option>
            <option value="Debit">Debits Only</option>
          </select>

          {/* Date From */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Date From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          {/* Date To */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Date To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
          </div>

          {/* Amount Range */}
          <div className="flex gap-2">
            <input type="number" placeholder="Min ₹" value={amtMin} onChange={e => setAmtMin(e.target.value)}
              className="w-1/2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            <input type="number" placeholder="Max ₹" value={amtMax} onChange={e => setAmtMax(e.target.value)}
              className="w-1/2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
        {/* Clear filters */}
        <button onClick={() => { setSearch(''); setFilterType('All'); setDateFrom(''); setDateTo(''); setAmtMin(''); setAmtMax('') }}
          className="mt-3 text-xs text-indigo-400 hover:text-indigo-300">
          ✕ Clear all filters ({filtered.length}/{transactions.length} shown)
        </button>
      </div>

      {/* Transaction Table */}
      <div className="border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-3 py-3 text-left text-gray-400 font-semibold">#</th>
                <th className="px-3 py-3 text-left text-gray-400 font-semibold">Date</th>
                <th className="px-3 py-3 text-left text-gray-400 font-semibold">Description</th>
                <th className="px-3 py-3 text-right text-red-400 font-semibold">Debit</th>
                <th className="px-3 py-3 text-right text-green-400 font-semibold">Credit</th>
                <th className="px-3 py-3 text-right text-gray-400 font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-3 py-8 text-center text-gray-500">No transactions match your filters</td></tr>
              ) : (
                filtered.map((t, idx) => (
                  <tr key={idx} className={`border-b border-gray-800 hover:bg-gray-800/50 ${idx%2===0?'bg-gray-950':'bg-gray-900/30'}`}>
                    <td className="px-3 py-2 text-gray-500 text-xs">{t.sno}</td>
                    <td className="px-3 py-2 text-gray-300 whitespace-nowrap text-xs">{t.dateRaw}</td>
                    <td className="px-3 py-2 text-gray-200 max-w-[200px] truncate" title={t.description}>{t.description}</td>
                    <td className="px-3 py-2 text-right text-red-400 font-mono text-xs">{t.debit ? fmt(t.debit) : ''}</td>
                    <td className="px-3 py-2 text-right text-green-400 font-mono text-xs">{t.credit ? fmt(t.credit) : ''}</td>
                    <td className="px-3 py-2 text-right text-gray-300 font-mono text-xs">{t.balance ? fmt(t.balance) : ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download buttons bottom */}
      <div className="flex gap-3 mt-4">
        <button onClick={() => downloadFile(toCSV(filtered), 'bank_statement.csv', 'text/csv')}
          className="btn-secondary flex-1">⬇️ Download CSV ({filtered.length} rows)</button>
        <button onClick={() => downloadFile(toXLSX(filtered), 'bank_statement.xlsx', 'application/vnd.ms-excel')}
          className="btn-primary flex-1">📊 Download Excel ({filtered.length} rows)</button>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">🔒 100% private — all processing in browser. No data uploaded.</p>
    </div>
  )
}

export default BankConverter
