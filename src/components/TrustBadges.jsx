import React from 'react'

function TrustBadges() {
  const badges = [
    { icon: '🔒', title: 'SSL Secured', desc: 'All connections encrypted' },
    { icon: '🛡️', title: 'Privacy First', desc: 'Files never uploaded to server' },
    { icon: '⚡', title: 'Instant Processing', desc: 'No waiting, no queues' },
    { icon: '♾️', title: 'No File Limits', desc: 'Any size, any number of files' },
    { icon: '🚫', title: 'No Registration', desc: 'No account, no email needed' },
    { icon: '💯', title: 'Always Free', desc: 'No hidden charges ever' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {badges.map((badge, i) => (
        <div key={i} className="flex flex-col items-center text-center p-3 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-indigo-500/30 transition-all">
          <span className="text-2xl mb-1">{badge.icon}</span>
          <p className="text-xs font-semibold text-gray-200">{badge.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{badge.desc}</p>
        </div>
      ))}
    </div>
  )
}

export default TrustBadges
