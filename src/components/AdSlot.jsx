// One ad unit. Renders NOTHING until a real client ID and a numeric slot ID are configured,
// so no placeholder ad code or empty ad boxes ever reach real visitors.
import { useEffect, useRef } from 'react'
import { ADSENSE_CLIENT_ID, isRealAdClient } from '../utils/adsense'

export default function AdSlot({ slot, className = '' }) {
  const ref = useRef(null)
  const ok = isRealAdClient && /^\d{6,}$/.test(String(slot || ''))

  useEffect(() => {
    if (!ok || !ref.current) return
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}) } catch (e) { /* ad blocked or already filled */ }
  }, [ok])

  if (!ok) return null
  return (
    <div className={`ad-container ${className}`}>
      <ins ref={ref} className="adsbygoogle" style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT_ID} data-ad-slot={slot}
        data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  )
}
