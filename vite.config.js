import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { GC_CODE } from './src/lib/analyticsConfig.js'

// Content-Security-Policy for the shipped app only (the dev server needs inline scripts for hot reload).
// Scripts only from the app itself; network only to the services the app really calls.
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",   // React sets inline style attributes
  "img-src 'self' data: https://raw.githubusercontent.com",
  "font-src 'self'",
  `connect-src 'self' https://openrouter.ai https://api.anthropic.com https://api.openai.com https://api.groq.com https://raw.githubusercontent.com${GC_CODE ? ` https://${GC_CODE}.goatcounter.com` : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ')

const cspPlugin = {
  name: 'csp',
  apply: 'build',
  transformIndexHtml: html => html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`),
}

export default defineConfig({
  // GitHub Pages serves the web app from /riftbuild/ (WEB_BASE); the Android build keeps the root
  base: process.env.WEB_BASE || '/',
  plugins: [react(), tailwindcss(), cspPlugin],
})
