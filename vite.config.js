import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  assetsInclude: ['**/*.wasm'],
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'upi-qr.png'],
      manifest: {
        name: 'PDF Master Pro',
        short_name: 'PDF Tools',
        description: '32 free PDF tools — merge, split, compress, convert. No limits, no login.',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        screenshots: [
          { src: '/og-image.png', sizes: '1200x630', type: 'image/png', form_factor: 'wide', label: 'PDF Master Pro Desktop' }
        ],
        categories: ['productivity', 'utilities'],
        lang: 'en-IN',
        shortcuts: [
          { name: 'Merge PDF',    url: '/merge',    description: 'Combine multiple PDFs' },
          { name: 'Compress PDF', url: '/compress', description: 'Reduce PDF file size' },
          { name: 'GST Invoice',  url: '/gst-invoice', description: 'Read GST invoices' },
        ]
      },
      workbox: {
        // App shell + core assets cache karo
        globPatterns: ['**/*.{js,css,html,ico,svg}'],
        // PDF tools browser mein process hote hain — offline bhi kaam karega
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 }
            }
          }
        ]
      },
      devOptions: { enabled: true }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    }
  }
})
