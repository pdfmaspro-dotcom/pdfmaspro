import React from 'react'
import { getTranslation } from '../data/translations'

const features = [
  { icon: '♾️', title: 'No File Size Limit',  desc: 'Process PDFs of any size — small or large, no restrictions whatsoever.' },
  { icon: '🚀', title: 'No Login Required',    desc: 'Start instantly. No account, no email, no credit card needed.' },
  { icon: '🔐', title: '100% Private',         desc: 'All processing happens in your browser. Your files never leave your device.' },
  { icon: '💯', title: 'Free Forever',         desc: 'Every tool is completely free with no hidden charges or premium upsells.' },
]

function WhyUse({ toolName }) {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">Why Use Our {toolName} Tool?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((f, i) => (
          <div key={i} className="flex gap-3 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
            <span className="text-2xl">{f.icon}</span>
            <div>
              <p className="font-semibold text-sm">{f.title}</p>
              <p className="text-gray-400 text-xs mt-1">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WhyUse
