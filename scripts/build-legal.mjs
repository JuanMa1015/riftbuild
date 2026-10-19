// Renders the privacy policy and terms (src/i18n/legal.js) to docs/*.html for GitHub Pages.
//   node scripts/build-legal.mjs
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
import { LEGAL, UPDATED, CONTACT, REPO } from '../src/i18n/legal.js'

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const SITE = 'https://juanma1015.github.io/riftbuild/'
mkdirSync('docs', { recursive: true })
copyFileSync('public/favicon.svg', 'docs/favicon.svg')

const css = `body{margin:0;background:#0f2a1f;color:#f1f5ee;font:17px/1.6 system-ui,sans-serif}main{max-width:42rem;margin:0 auto;padding:1.5rem 1rem 4rem}
h1{font-size:1.6rem}h2{font-size:1.1rem;margin-top:2rem;color:#f4c430}a{color:#f4c430}nav{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem}small{color:#b7c4b9}`

const file = (lang, doc) => (lang === 'es' ? '' : 'en-') + doc + '.html'

function page(lang, doc, title) {
  const L = LEGAL[lang], d = L[doc]
  const other = lang === 'es' ? 'en' : 'es'
  const body = d.sections.map(([h, p]) => `<h2>${esc(h)}</h2><p>${esc(p)}</p>`).join('\n')
  const t = title || `${d.title} · RiftBuild`
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(t)}</title>
<meta name="description" content="${esc(d.sections[0][1])}">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<meta property="og:title" content="${esc(t)}"><meta property="og:type" content="website">
<meta property="og:url" content="${SITE}${file(lang, doc)}"><meta property="og:image" content="${SITE}og.png">
<meta name="twitter:card" content="summary_large_image">
<style>${css}</style></head><body><main>
<nav><a href="${file(lang, 'privacy')}">${esc(L.privacy.title)}</a><a href="${file(lang, 'terms')}">${esc(L.terms.title)}</a><a href="${file(other, doc)}">${other === 'es' ? 'Español' : 'English'}</a><a href="${REPO}">GitHub</a></nav>
<h1>${esc(d.title)}</h1><small>${L.updated}: ${UPDATED}</small>
${body}
<p><small>Contact: <a href="${CONTACT}">${CONTACT}</a></small></p>
</main></body></html>`
}

for (const lang of ['es', 'en']) for (const doc of ['privacy', 'terms']) writeFileSync(`docs/${file(lang, doc)}`, page(lang, doc))
writeFileSync('docs/index.html', page('es', 'privacy', 'RiftBuild · Privacidad y términos'))
console.log('docs/ written', existsSync('docs/og.png') ? '' : '(missing docs/og.png: add the Open Graph image)')
