import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const popularTools = [
  { name: 'Merge PDF', path: '/merge', icon: '🔗' },
  { name: 'Compress PDF', path: '/compress', icon: '🗜️' },
  { name: 'PDF to JPG', path: '/pdf-to-jpg', icon: '🖼️' },
  { name: 'OCR PDF', path: '/ocr-pdf', icon: '🔍' },
  { name: 'Bank Converter', path: '/bank-converter', icon: '🏦' },
  { name: 'GST Invoice', path: '/gst-invoice', icon: '🧾' },
]

function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | PDF Master Pro</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="container mx-auto px-4 py-20 text-center max-w-2xl">
        <div className="text-8xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
        <p className="text-gray-400 mb-10">
          The page you're looking for doesn't exist. Try one of our free PDF tools below.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {popularTools.map(tool => (
            <Link key={tool.path} to={tool.path}
              className="card hover:border-indigo-500 text-center py-4 px-3">
              <div className="text-2xl mb-1">{tool.icon}</div>
              <div className="text-sm font-medium">{tool.name}</div>
            </Link>
          ))}
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/" className="btn-primary px-6 py-2">🏠 All PDF Tools</Link>
          <Link to="/contact" className="btn-secondary px-6 py-2">📩 Report Issue</Link>
        </div>
      </div>
    </>
  )
}

export default NotFound
