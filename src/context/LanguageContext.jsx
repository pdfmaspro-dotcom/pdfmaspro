import React, { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    (typeof localStorage !== 'undefined' && localStorage.getItem('pdf_lang')) || 'en'
  )

  const switchLang = (newLang) => {
    setLang(newLang)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pdf_lang', newLang)
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, switchLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
export default LanguageContext
