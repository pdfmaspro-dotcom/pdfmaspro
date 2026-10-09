import React from 'react'
import { useLang } from '../context/LanguageContext'

const languages = [
  { code: 'en', label: 'EN', flag: '🇺🇸', name: 'English' },
  { code: 'hi', label: 'HI', flag: '🇮🇳', name: 'हिंदी' },
]

function LanguageSwitcher() {
  const { lang, switchLang } = useLang()

  return (
    <div className="flex items-center gap-1">
      {languages.map(l => (
        <button
          key={l.code}
          onClick={() => switchLang(l.code)}
          title={l.name}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
            lang === l.code
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <span>{l.flag}</span>
          <span>{l.label}</span>
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
