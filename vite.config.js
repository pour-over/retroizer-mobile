import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' is CRITICAL for Capacitor — app is served from file:// on device
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0, // keep all assets as files, not base64 — more reliable in WebView
  },
})
