import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'

const LARGE_FILE_MB = 100

function FileUploader({ onFileSelect, accept, multiple = false, label = "Drag & drop a file here, or click to select" }) {
  const [warning, setWarning] = useState('')
  const handleDrop = (accepted, ...rest) => {
    const big = (accepted || []).find(f => f.size > LARGE_FILE_MB * 1024 * 1024)
    setWarning(big
      ? `This file is large (${Math.round(big.size / 1024 / 1024)} MB). Everything runs inside your browser, so it may be slow or fail on devices with limited memory. If it stalls, try a smaller file or a desktop browser.`
      : '')
    onFileSelect(accepted, ...rest)
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple,
    onDrop: handleDrop
  })

  return (
    <>
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
        isDragActive ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' : 'border-gray-700 hover:border-indigo-500/50 hover:bg-gray-800/30'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex justify-center mb-4">
        {isDragActive ? (
          <svg className="w-14 h-14 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1"/>
            <polyline points="16 9 12 5 8 9"/>
            <line x1="12" y1="5" x2="12" y2="16"/>
          </svg>
        ) : (
          <svg className="w-14 h-14 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="M12 12v6"/><path d="m9 15 3-3 3 3"/>
          </svg>
        )}
      </div>
      <p className="text-gray-300 font-medium">
        {isDragActive ? 'Drop file here...' : label}
      </p>
      <p className="text-gray-500 text-sm mt-2">
        {isDragActive ? '↓ Release to upload' : 'Drag & drop or click to browse'}
      </p>
    </div>
    {warning && <p className="text-yellow-300 text-sm mt-3">{warning}</p>}
    </>
  )
}

export { FileUploader }
export default FileUploader
