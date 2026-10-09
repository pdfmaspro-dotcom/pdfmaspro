import React, { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import FileUploader from '../components/FileUploader'
import ProgressBar from '../components/ProgressBar'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function PDFWordCount() {
  const [file, setFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState(null)

  const analyse = async () => {
    if (!file) { alert('Please select a PDF file'); return }
    setProcessing(true); setProgress(0); setStats(null)
    try {
      const buffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      let fullText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        fullText += content.items.map(item => item.str).join(' ') + '\n'
        setProgress((i / pdf.numPages) * 100)
      }
      const words = fullText.trim().split(/\s+/).filter(w => w.length > 0)
      const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const paragraphs = fullText.split(/\n\s*\n/).filter(p => p.trim().length > 0)
      const avgWordsPerPage = Math.round(words.length / pdf.numPages)
      const readingMinutes = Math.ceil(words.length / 200)

      setStats({
        pages: pdf.numPages,
        characters: fullText.replace(/\s/g, '').length,
        charactersWithSpaces: fullText.length,
        words: words.length,
        sentences: sentences.length,
        paragraphs: paragraphs.length,
        avgWordsPerPage,
        readingMinutes,
        fileSize: (file.size / 1024).toFixed(1)
      })
    } catch (err) {
      alert('Error analysing PDF: ' + err.message)
    } finally { setProcessing(false) }
  }

  const StatCard = ({ label, value, sub }) => (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-indigo-400">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-300 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )

  return (
    <div>
      <FileUploader onFileSelect={(f) => { setFile(f[0]); setStats(null) }} accept={{ 'application/pdf': ['.pdf'] }} />
      {file && !stats && (
        <button onClick={analyse} disabled={processing} className="btn-primary w-full mt-4">
          {processing ? 'Analysing...' : 'Analyse PDF'}
        </button>
      )}
      {processing && <ProgressBar progress={progress} />}
      {stats && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">📊 Analysis Results — <span className="text-gray-400 text-base font-normal">{file.name}</span></h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <StatCard label="Pages" value={stats.pages} />
            <StatCard label="Words" value={stats.words} />
            <StatCard label="Characters" value={stats.characters} sub="without spaces" />
            <StatCard label="Sentences" value={stats.sentences} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Paragraphs" value={stats.paragraphs} />
            <StatCard label="Avg Words/Page" value={stats.avgWordsPerPage} />
            <StatCard label="Reading Time" value={stats.readingMinutes} sub="minutes (200 wpm)" />
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-indigo-400">{stats.fileSize} KB</p>
              <p className="text-sm text-gray-300 mt-1">File Size</p>
            </div>
          </div>
          <button onClick={() => { setStats(null); setFile(null) }} className="btn-secondary w-full">Analyse Another PDF</button>
        </div>
      )}
    </div>
  )
}

export default PDFWordCount
