// Loads the AdSense script only when a REAL publisher ID is configured
// (VITE_ADSENSE_CLIENT_ID=ca-pub-<digits>). Placeholders are ignored.
import { useEffect } from 'react'
import { ADSENSE_CLIENT_ID, isRealAdClient } from '../utils/adsense'

function AdSenseLoader() {
  useEffect(() => {
    if (!isRealAdClient || document.getElementById('adsbygoogle-script')) return
    const script = document.createElement('script')
    script.id = 'adsbygoogle-script'
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)
  }, [])
  return null
}

export default AdSenseLoader
