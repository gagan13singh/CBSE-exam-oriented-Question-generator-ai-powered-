import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Vidyastra',
        short_name: 'Vidyastra',
        description: 'AI-Powered CBSE Question Generator',
        theme_color: '#0b1120',
        background_color: '#0b1120',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '192x192',
            type: 'image/x-icon'
          },
          {
            src: 'favicon.ico',
            sizes: '512x512',
            type: 'image/x-icon',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
