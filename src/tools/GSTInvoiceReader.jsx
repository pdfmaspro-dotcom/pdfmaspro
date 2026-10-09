import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function GSTInvoiceReader() {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [data, setData] = useState(null)

  const extractGSTData = async () => {
    if (!file) { alert('Please select a PDF invoice'); return }
    setProcessing(true); setProgress(0); setData(null)
    try {
      const buffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      let fullText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        fullText += content.items.map(item => item.str).join(' ') + '\n'
        setProgress((i / pdf.numPages) * 70)
      }

      const extract = (patterns) => {
        for (const pattern of patterns) {
          const match = fullText.match(pattern)
          if (match) return match[1].trim()
        }
        return null
      }

      setProgress(85)
      const result = {
        gstNumber:    extract([/GST(?:IN)?(?:\s*:?\s*|\s+No\.?\s*)([0-9A-Z]{15})/i, /([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})/]),
        invoiceNo:    extract([/Invoice\s*(?:No\.?|Number)\s*[:\-]?\s*([A-Z0-9\-\/]+)/i, /Bill\s*No\.?\s*[:\-]?\s*([A-Z0-9\-\/]+)/i]),
        invoiceDate:  extract([/Invoice\s*Date\s*[:\-]?\s*(\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{2,4})/i, /Date\s*[:\-]?\s*(\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{2,4})/i]),
        sellerName:   extract([/Sold\s*By\s*[:\-]?\s*([^\n]+)/i, /Seller\s*[:\-]?\s*([^\n]+)/i]),
        buyerName:    extract([/Bill\s*To\s*[:\-]?\s*([^\n]+)/i, /Buyer\s*[:\-]?\s*([^\n]+)/i, /Ship\s*To\s*[:\-]?\s*([^\n]+)/i]),
        totalAmount:  extract([/(?:Grand\s+)?Total(?:\s+Amount)?\s*[:\-₹]?\s*(?:Rs\.?\s*)?(\d[\d,]*\.?\d*)/i, /Amount\s*Payable\s*[:\-₹]?\s*(\d[\d,]*\.?\d*)/i]),
        cgst:         extract([/CGST\s*(?:@[\d.]+%)?\s*[:\-₹]?\s*(\d[\d,]*\.?\d*)/i]),
        sgst:         extract([/SGST\s*(?:@[\d.]+%)?\s*[:\-₹]?\s*(\d[\d,]*\.?\d*)/i]),
        igst:         extract([/IGST\s*(?:@[\d.]+%)?\s*[:\-₹]?\s*(\d[\d,]*\.?\d*)/i]),
        taxableAmount:extract([/Taxable\s*(?:Value|Amount)\s*[:\-₹]?\s*(\d[\d,]*\.?\d*)/i, /(?:Sub\s*)?Total\s*(?:Before\s*Tax)?\s*[:\-₹]?\s*(\d[\d,]*\.?\d*)/i]),
        hsn:          extract([/HSN\s*(?:Code|\/SAC)?\s*[:\-]?\s*([0-9]{4,8})/i]),
        pan:          extract([/PAN\s*[:\-]?\s*([A-Z]{5}[0-9]{4}[A-Z]{1})/i]),
      }
      setProgress(100)
      setData({ ...result, rawText: fullText.substring(0, 2000) })
    } catch (err) {
      alert('Error reading invoice: ' + err.message)
    } finally { setProcessing(false) }
  }

  const downloadCSV = () => {
    if (!data) return
    const rows = [
      ['Field', 'Extracted Value'],
      ['GSTIN', data.gstNumber || ''],
      ['Invoice No', data.invoiceNo || ''],
      ['Invoice Date', data.invoiceDate || ''],
      ['Seller Name', data.sellerName || ''],
      ['Buyer Name', data.buyerName || ''],
      ['Taxable Amount', data.taxableAmount || ''],
      ['CGST', data.cgst || ''],
      ['SGST', data.sgst || ''],
      ['IGST', data.igst || ''],
      ['Total Amount', data.totalAmount || ''],
      ['HSN Code', data.hsn || ''],
      ['PAN', data.pan || ''],
    ]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = 'gst-invoice-data.csv'; a.click()
  }

  const Field = ({ label, value }) => (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-400 w-40 shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right ${value ? 'text-white' : 'text-gray-600'}`}>
        {value || 'Not found'}
      </span>
    </div>
  )

  return (
    <div>
      <div className="mb-4 p-3 bg-amber-900/20 border border-amber-800/50 rounded-lg">
        <p className="text-xs text-amber-300">🇮🇳 Works with GST invoices from Amazon, Flipkart, Myntra, Swiggy, Zomato, IRCTC, all Indian sellers and businesses.</p>
      </div>
      <FileUploader onFileSelect={(f) => { setFile(f[0]); setData(null) }} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && !data && (
        <button onClick={extractGSTData} disabled={processing} className="btn-primary w-full mt-4">
          {processing ? 'Reading Invoice...' : 'Extract GST Data'}
        </button>
      )}
      {processing && <ProgressBar progress={progress} />}
      {data && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Extracted Invoice Data</h3>
            <button onClick={downloadCSV} className="btn-primary text-sm px-4 py-2">⬇️ Download CSV</button>
          </div>
          <div className="card">
            <Field label="GSTIN" value={data.gstNumber} />
            <Field label="Invoice No" value={data.invoiceNo} />
            <Field label="Invoice Date" value={data.invoiceDate} />
            <Field label="Seller Name" value={data.sellerName} />
            <Field label="Buyer Name" value={data.buyerName} />
            <Field label="HSN Code" value={data.hsn} />
            <Field label="PAN" value={data.pan} />
            <Field label="Taxable Amount" value={data.taxableAmount ? '₹ ' + data.taxableAmount : null} />
            <Field label="CGST" value={data.cgst ? '₹ ' + data.cgst : null} />
            <Field label="SGST" value={data.sgst ? '₹ ' + data.sgst : null} />
            <Field label="IGST" value={data.igst ? '₹ ' + data.igst : null} />
            <Field label="Total Amount" value={data.totalAmount ? '₹ ' + data.totalAmount : null} />
          </div>
          <p className="text-xs text-gray-500 mt-3">Pattern-based extraction — verify important values against original invoice.</p>
          <button onClick={() => { setData(null); setFile(null) }} className="btn-secondary w-full mt-3">Read Another Invoice</button>
        </div>
      )}
    </div>
  )
}

export default GSTInvoiceReader
