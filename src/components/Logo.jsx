import React from 'react'
import { Link } from 'react-router-dom'

// PDF document icon — clean SVG, no emoji
function PDFIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#logoGrad)"/>
      <rect x="7" y="5" width="14" height="18" rx="1.5" fill="white" opacity="0.95"/>
      <path d="M17 5 L21 9 L17 9 Z" fill="#6366f1" opacity="0.5"/>
      <rect x="9" y="12" width="8" height="1.5" rx="0.75" fill="#6366f1" opacity="0.7"/>
      <rect x="9" y="15" width="10" height="1.5" rx="0.75" fill="#6366f1" opacity="0.5"/>
      <rect x="9" y="18" width="6" height="1.5" rx="0.75" fill="#6366f1" opacity="0.35"/>
      <circle cx="22" cy="22" r="5" fill="#10b981"/>
      <text x="22" y="25.5" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="5.5" fontWeight="bold" fill="white">Pro</text>
    </svg>
  )
}

function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 group ${className}`} aria-label="PDF Master Pro — Home">
      <PDFIcon size={32} />
      <div className="leading-none">
        <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
          PDF Tools
        </span>
        <span className="ml-1 text-xs font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-md align-middle">
          PRO
        </span>
      </div>
    </Link>
  )
}

export { PDFIcon }
export default Logo
