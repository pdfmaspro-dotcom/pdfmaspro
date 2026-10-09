import React, { useState } from 'react'
import { FAQSchema } from './SchemaMarkup'

function FAQ({ items, title = "Frequently Asked Questions" }) {
  const [openIndex, setOpenIndex] = useState(null)

  if (!items || items.length === 0) return null

  return (
    <div className="mt-12">
      <FAQSchema faqs={items} />
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="border border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full px-5 py-4 text-left flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              <h3 className="font-semibold text-sm md:text-base pr-4">{item.q}</h3>
              <span className={`text-gray-400 transition-transform flex-shrink-0 ${openIndex === idx ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {openIndex === idx && (
              <div className="px-5 py-4 bg-gray-950 border-t border-gray-700">
                <p className="text-gray-300 text-sm leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQ
