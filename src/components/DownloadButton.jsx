import React from 'react'

function DownloadButton({ url, filename, label = "Download Result" }) {
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    // Blob URL release karo download ke baad (memory free hoti hai)
    if (url && url.startsWith('blob:')) {
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  }

  return (
    <button onClick={handleDownload} className="btn-primary w-full mt-4">
      ⬇️ {label}
    </button>
  )
}

export default DownloadButton
