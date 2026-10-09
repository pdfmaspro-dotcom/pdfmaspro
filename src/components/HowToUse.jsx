import React from 'react'

function HowToUse({ steps }) {
  if (!steps || steps.length === 0) return null
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-5">How to Use</h2>
      <div className="flex flex-col md:flex-row gap-4">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 flex items-start gap-3 p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {i + 1}
            </div>
            <div>
              <p className="font-semibold text-sm">{step.title}</p>
              <p className="text-gray-400 text-xs mt-1">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HowToUse
