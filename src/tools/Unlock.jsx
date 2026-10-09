import React, { useState } from 'react'
import FileUploader from '../components/FileUploader'
import DownloadButton from '../components/DownloadButton'
import ProgressBar from '../components/ProgressBar'

function Unlock() {
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const unlockPDF = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0)
    try {
      const fileBuffer = await file.arrayBuffer()
      setProgress(15)

      // Real decryption: qpdf compiled to WebAssembly, running inside the browser.
      // (pdf-lib cannot decrypt PDFs.) Nothing is uploaded anywhere.
      const [qpdfMod, wasmMod] = await Promise.all([
        import('@neslinesli93/qpdf-wasm'),
        import('@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url'),
      ])
      const unwrap = (m) => { let v = m; while (v && typeof v === 'object' && 'default' in v) v = v.default; return v }
      const createQpdf = unwrap(qpdfMod)
      const wasmUrl = unwrap(wasmMod)
      setProgress(40)

      const qpdf = await createQpdf({
        locateFile: () => wasmUrl,
        noInitialRun: true,
        print: () => {},
        printErr: () => {},
      })
      qpdf.FS.writeFile('/in.pdf', new Uint8Array(fileBuffer))
      setProgress(60)

      const args = password
        ? [`--password=${password}`, '--decrypt', '/in.pdf', '/out.pdf']
        : ['--decrypt', '/in.pdf', '/out.pdf']
      let code
      try { code = qpdf.callMain(args) } catch (e) { code = (e && e.status) ?? 2 }

      let out = null
      try { out = qpdf.FS.readFile('/out.pdf') } catch (e) { out = null }

      // qpdf exit codes: 0 = success, 3 = success with warnings, 2 = error
      if ((code !== 0 && code !== 3) || !out) {
        alert(password
          ? 'Could not unlock this PDF. The password may be incorrect, or the file may be damaged.'
          : 'Could not open this PDF. If it is password protected, enter the password and try again.')
        setProcessing(false); return
      }

      setProgress(100)
      const blob = new Blob([out], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), filename: 'unlocked.pdf' })
    } catch (error) {
      console.error(error)
      alert('Could not unlock PDF. Please check your password and try again.')
    } finally { setProcessing(false) }
  }

  if (result) return (
    <div className="card text-center">
      <p className="text-green-400 mb-4">✓ PDF unlocked successfully!</p>
      <DownloadButton url={result.url} filename={result.filename} />
      <button onClick={() => { setResult(null); setFile(null); setPassword('') }} className="btn-secondary w-full mt-3">Unlock Another</button>
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(files) => setFile(files[0])} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && (
        <>
          <p className="text-indigo-400 mt-4">📄 {file.name}</p>
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Password (leave empty if the PDF opens without one)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter PDF password" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500" />
          </div>
          <button onClick={unlockPDF} disabled={processing} className="btn-primary w-full mt-4">
            {processing ? 'Unlocking...' : 'Unlock PDF'}
          </button>
        </>
      )}
      {processing && <ProgressBar progress={progress} />}
    </div>
  )
}

export default Unlock
