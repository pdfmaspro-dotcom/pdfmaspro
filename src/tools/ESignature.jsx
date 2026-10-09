import React, { useState, useRef, useEffect } from 'react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import DownloadButton from '../components/DownloadButton'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const MODES = { DRAW: 'draw', TYPE: 'type', UPLOAD: 'upload' }
const COLORS = ['#1e1b4b', '#1e3a5f', '#7f1d1d', '#14532d', '#000000']

function ESignature() {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfPages, setPdfPages] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [mode, setMode] = useState(MODES.DRAW)
  const [typedName, setTypedName] = useState('')
  const [signatureImg, setSignatureImg] = useState(null)  // base64
  const [uploadedSig, setUploadedSig] = useState(null)
  const [sigColor, setSigColor] = useState('#1e1b4b')
  const [placement, setPlacement] = useState(null)        // { x, y, w, h } in % of page
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const canvasRef = useRef(null)
  const previewRef = useRef(null)
  const drawing = useRef(false)
  const lastPos = useRef(null)
  const sigUploadRef = useRef(null)

  // ── Draw mode ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== MODES.DRAW) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = sigColor
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [mode, sigColor])

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const startDraw = (e) => {
    drawing.current = true
    lastPos.current = getPos(e, canvasRef.current)
  }

  const draw = (e) => {
    if (!drawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  const endDraw = () => {
    drawing.current = false
    setSignatureImg(canvasRef.current.toDataURL('image/png'))
  }

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setSignatureImg(null)
  }

  // ── Type signature → canvas ────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== MODES.TYPE || !typedName) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = sigColor
    ctx.font = `italic 40px 'Dancing Script', Georgia, serif`
    ctx.fillText(typedName, 16, 56)
    setSignatureImg(canvas.toDataURL('image/png'))
  }, [typedName, sigColor, mode])

  // ── Load PDF for preview ───────────────────────────────────────────────────
  const loadPDF = async (file) => {
    setPdfFile(file)
    setPlacement(null)
    setResult(null)
    try {
      const buf = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise
      const pages = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const vp = page.getViewport({ scale: 1.2 })
        const canvas = document.createElement('canvas')
        canvas.width = vp.width
        canvas.height = vp.height
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
        pages.push({ dataUrl: canvas.toDataURL(), width: vp.width, height: vp.height, origWidth: page.getViewport({ scale: 1 }).width, origHeight: page.getViewport({ scale: 1 }).height })
      }
      setPdfPages(pages)
    } catch (e) { setError('Could not load PDF: ' + e.message) }
  }

  // ── Click on preview to place signature ───────────────────────────────────
  const handlePreviewClick = (e) => {
    const activeSig = mode === MODES.UPLOAD ? uploadedSig : signatureImg
    if (!activeSig) { setError('Please draw, type, or upload your signature first.'); return }
    const rect = previewRef.current.getBoundingClientRect()
    const xPct = (e.clientX - rect.left) / rect.width
    const yPct = (e.clientY - rect.top) / rect.height
    setPlacement({ x: xPct, y: yPct, w: 0.25, h: 0.07 })
    setError('')
  }

  // ── Embed signature into PDF ───────────────────────────────────────────────
  const applySignature = async () => {
    if (!pdfFile || !placement) { setError('Please place your signature on the PDF first.'); return }
    const activeSig = mode === MODES.UPLOAD ? uploadedSig : signatureImg
    if (!activeSig) { setError('Please create a signature first.'); return }
    setProcessing(true); setError('')

    try {
      const pdfBytes = await pdfFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(pdfBytes)
      const pages = pdfDoc.getPages()
      const pg = pages[currentPage]
      const { width: pgW, height: pgH } = pg.getSize()

      // Convert base64 sig to png bytes
      const base64 = activeSig.split(',')[1]
      const sigBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const sigImage = await pdfDoc.embedPng(sigBytes)

      const sigW = pgW * placement.w
      const sigH = pgH * placement.h
      const sigX = pgW * placement.x - sigW / 2
      // PDF y is bottom-up
      const sigY = pgH - (pgH * placement.y) - sigH / 2

      pg.drawImage(sigImage, { x: sigX, y: sigY, width: sigW, height: sigH })

      // Add signed timestamp at bottom
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      pg.drawText(`Signed on ${new Date().toLocaleDateString('en-IN')}`, {
        x: 40, y: 20, size: 7, font, color: rgb(0.5, 0.5, 0.5)
      })

      const out = await pdfDoc.save()
      const blob = new Blob([out], { type: 'application/pdf' })
      const base = pdfFile.name.replace('.pdf', '')
      setResult({ url: URL.createObjectURL(blob), filename: `${base}-signed.pdf` })
    } catch (e) {
      setError('Failed to apply signature: ' + e.message)
    } finally {
      setProcessing(false)
    }
  }

  const activeSig = mode === MODES.UPLOAD ? uploadedSig : signatureImg

  return (
    <div className="space-y-6">
      {!pdfFile ? (
        // Step 1 — Upload PDF
        <div>
          <h2 className="text-lg font-semibold mb-4">Step 1 — Upload your PDF</h2>
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') loadPDF(f) }}
            onClick={() => document.getElementById('pdf-upload-esig').click()}
            className="border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-2xl p-12 text-center cursor-pointer transition-all">
            <div className="flex justify-center mb-3">
              <svg className="w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <p className="text-gray-400">Drag & drop your PDF here or click to browse</p>
            <input id="pdf-upload-esig" type="file" accept="application/pdf" className="hidden"
              onChange={e => { if (e.target.files[0]) loadPDF(e.target.files[0]) }} />
          </div>
        </div>
      ) : (
        <>
          {/* Step 2 — Create Signature */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Step 2 — Create Signature</h2>
            <div className="flex gap-2 mb-4 flex-wrap">
              {Object.values(MODES).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${mode === m ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300' : 'border-gray-700 text-gray-400'}`}>
                  {m === MODES.DRAW ? '✏️ Draw' : m === MODES.TYPE ? '⌨️ Type' : '🖼 Upload'}
                </button>
              ))}
            </div>

            {/* Color picker */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500">Color:</span>
              {COLORS.map(c => (
                <button key={c} onClick={() => setSigColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${sigColor === c ? 'border-white scale-125' : 'border-transparent'}`}
                  style={{ background: c }} />
              ))}
            </div>

            {/* Signature area */}
            <div className="relative">
              {mode === MODES.TYPE && (
                <input type="text" placeholder="Type your full name..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg mb-2 text-lg italic focus:outline-none focus:border-indigo-500"
                  style={{ fontFamily: 'Georgia, serif', color: sigColor }}
                  value={typedName} onChange={e => setTypedName(e.target.value)} />
              )}
              {mode === MODES.UPLOAD && (
                <div className="mb-2">
                  <button onClick={() => sigUploadRef.current.click()} className="btn-secondary text-sm">
                    Upload Signature Image (PNG/JPG)
                  </button>
                  <input ref={sigUploadRef} type="file" accept="image/*" className="hidden"
                    onChange={e => {
                      const f = e.target.files[0]
                      if (!f) return
                      const reader = new FileReader()
                      reader.onload = ev => setUploadedSig(ev.target.result)
                      reader.readAsDataURL(f)
                    }} />
                </div>
              )}

              <canvas ref={canvasRef} width={480} height={100}
                className={`w-full rounded-xl border ${mode === MODES.DRAW ? 'border-indigo-600 bg-white/5 cursor-crosshair' : 'border-gray-700 bg-transparent'}`}
                style={{ display: mode === MODES.UPLOAD ? 'none' : 'block', touchAction: 'none' }}
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />

              {mode === MODES.DRAW && (
                <button onClick={clearCanvas} className="mt-2 text-xs text-gray-500 hover:text-red-400">✕ Clear</button>
              )}
              {mode === MODES.UPLOAD && uploadedSig && (
                <img src={uploadedSig} alt="Uploaded signature" className="h-16 mt-2 rounded-lg border border-gray-700" />
              )}
            </div>
          </div>

          {/* Step 3 — Place on PDF */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Step 3 — Click on PDF to place signature</h2>
            {pdfPages.length > 1 && (
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-sm text-gray-400">Page:</span>
                {pdfPages.map((_, i) => (
                  <button key={i} onClick={() => { setCurrentPage(i); setPlacement(null) }}
                    className={`px-3 py-1 rounded text-xs border ${currentPage === i ? 'border-indigo-500 text-indigo-300' : 'border-gray-700 text-gray-400'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}

            {pdfPages[currentPage] && (
              <div className="relative cursor-crosshair select-none rounded-xl overflow-hidden border border-gray-700"
                ref={previewRef} onClick={handlePreviewClick}
                style={{ maxHeight: '480px', overflowY: 'auto' }}>
                <img src={pdfPages[currentPage].dataUrl} alt={`Page ${currentPage + 1}`} className="w-full pointer-events-none" draggable={false} />
                {placement && activeSig && (
                  <img src={activeSig} alt="Signature preview"
                    className="absolute pointer-events-none"
                    style={{
                      left: `${(placement.x - placement.w / 2) * 100}%`,
                      top: `${(placement.y - placement.h / 2) * 100}%`,
                      width: `${placement.w * 100}%`,
                      opacity: 0.9,
                    }} />
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: placement ? 0 : 0.6 }}>
                  <div className="bg-indigo-900/80 text-indigo-200 px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
                    👆 Click anywhere to place signature
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {result ? (
            <div className="card text-center">
              <p className="text-green-400 font-semibold mb-4">✅ Signature applied successfully!</p>
              <DownloadButton url={result.url} filename={result.filename} />
              <button onClick={() => { setResult(null); setPlacement(null) }} className="btn-secondary w-full mt-3">Sign Again</button>
            </div>
          ) : (
            <button onClick={applySignature} disabled={processing || !placement}
              className="btn-primary w-full py-3">
              {processing ? '⏳ Applying...' : placement ? '✍️ Apply Signature & Download' : 'Place signature on PDF first'}
            </button>
          )}

          <button onClick={() => { setPdfFile(null); setPdfPages([]); setPlacement(null); setResult(null) }}
            className="btn-secondary w-full text-sm">← Change PDF</button>
        </>
      )}

      <div className="card bg-indigo-900/20 border-indigo-800">
        <p className="text-sm text-indigo-300 font-medium mb-2">🔒 100% Private</p>
        <p className="text-xs text-gray-400">Signing happens entirely in your browser. Your PDF and signature never leave your device.</p>
      </div>
    </div>
  )
}

export default ESignature
