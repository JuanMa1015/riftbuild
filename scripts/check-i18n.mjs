// Fails when a Spanish game string has no English counterpart. Run: npm run check:i18n
import { readFileSync } from 'node:fs'
const g = JSON.parse(readFileSync(new URL('../public/data/game.json', import.meta.url), 'utf8'))
const need = new Set()
const runeNames = new Set() // minor runes are already English; keystones are not
for (const [name, it] of Object.entries(g.items)) { need.add(name); need.add(it.desc); need.add(it.t) }
for (const b of Object.values(g.builds)) {
  for (const k of ['ksn', 'sn', 'tip']) need.add(b[k])
  runeNames.add(b.ks)
  for (const r of b.runas) { runeNames.add(r.n); need.add(r.p) }
}
// literals the engine passes through tr()
const engine = readFileSync(new URL('../src/data/builds.js', import.meta.url), 'utf8')
for (const m of engine.matchAll(/tr\(\s*"([^"]+)"/g)) need.add(m[1])
const english = /^[\x20-\x7E⚡–—’]+$/ // already-English strings (minor runes) need no entry
const missing = [...need].filter(s => s && !g.en[s] && !english.test(s))
if (missing.length) { console.error('Missing English for:\n- ' + missing.join('\n- ')); process.exit(1) }
console.log(`i18n ok (${need.size} strings checked)`)
