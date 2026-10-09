// Shared AdSense config. Ads only render when a REAL publisher ID is set.
export const ADSENSE_CLIENT_ID = (import.meta.env.VITE_ADSENSE_CLIENT_ID || '').trim()
export const isRealAdClient = /^ca-pub-\d{10,}$/.test(ADSENSE_CLIENT_ID)
