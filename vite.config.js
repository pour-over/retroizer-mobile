import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// base: './' is CRITICAL for Capacitor — app is served from file:// on device
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      // Rolldown (Vite 8) can't resolve Tone.js's internal ESM relative imports.
      // Point to the self-contained UMD bundle instead — same API, no sub-imports.
      'tone': path.resolve(__dirname, 'node_modules/tone/build/Tone.js'),
    },
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0, // keep all assets as files, not base64 — more reliable in WebView
  },
})
