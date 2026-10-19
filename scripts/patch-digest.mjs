// Lists what the latest official patch notes say about the items and champions this app uses,
// so a human can review the build templates in public/data/game.json.
//   node scripts/patch-digest.mjs  -> prints Markdown (empty output = nothing relevant)
// Nothing is edited automatically: nobody can tell from public data what the meta does after a patch.
import { readFileSync } from 'node:fs'

const game = JSON.parse(readFileSync(new URL('../public/data/game.json', import.meta.url), 'utf8'))
const get = async u => (await fetch(u)).text()
const base = 'https://wildrift.leagueoflegends.com'

const list = await get(`${base}/en-us/news/game-updates/`)
const slugs = [...new Set([...list.matchAll(/game-updates\/(wild-rift-patch-notes-[0-9a-z-]+)/g)].map(m => m[1]))]
// slugs are inconsistent: "7-3b" for some patches, "72e" (no separator) for others
const ver = s => s.replace('wild-rift-patch-notes-', '').replace(/-+$/, '').replace(/-/g, '.').replace(/^(\d)(\d[a-z]?)$/, '$1.$2')
slugs.sort((a, b) => ver(a).localeCompare(ver(b), 'en', { numeric: true }))
const slug = process.argv[2] || slugs.at(-1)
if (!slug) process.exit(0)

const html = await get(`${base}/en-us/news/game-updates/${slug}/`)
const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'")
  .split('\n').map(s => s.trim()).filter(Boolean)

// section starts at its heading and ends at the next known heading
const HEADS = ['Champion Changes', 'Gameplay Changes', 'Items', 'Runes', 'Other Battlefield Content', 'Game Mode Changes', 'Bug Fixes']
function section(name) {
  const i = text.indexOf(name)
  if (i < 0) return []
  const rest = text.slice(i + 1)
  const end = rest.findIndex(l => HEADS.includes(l))
  return end < 0 ? rest : rest.slice(0, end)
}

const itemNames = Object.keys(game.items).map(es => ({ es, en: game.en[es] ?? es }))
const items = section('Items')
const hitsItems = itemNames.filter(n => items.some(l => l.toLowerCase().includes(n.en.toLowerCase())))
const mine = new Set(game.champions.map(c => c.n))
const champs = section('Champion Changes').filter(l => [...mine].some(n => l.toLowerCase() === n.toLowerCase()))

console.error(`patch ${ver(slug)}: ${items.length} item lines, ${hitsItems.length} of ours mentioned, ${champs.length} champion lines`)
const out = []
if (hitsItems.length) out.push('### Ítems de la app mencionados', ...hitsItems.map(n => `- **${n.es}** (${n.en})`), '', '```', ...items.slice(0, 80), '```')
if (champs.length) out.push('', '### Campeones con cambios', champs.map(c => `- ${c}`).join('\n'))
if (out.length) console.log(`## Parche ${ver(slug)}: revisar builds\n\nFuente: ${base}/en-us/news/game-updates/${slug}/\n\n${out.join('\n')}`)
