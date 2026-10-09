import React from 'react'

function ProgressBar({ progress }) {
  return (
    <div className="mt-6">
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-sm text-gray-400 mt-2">Processing... {Math.round(progress)}%</p>
    </div>
  )
}

export default ProgressBar
