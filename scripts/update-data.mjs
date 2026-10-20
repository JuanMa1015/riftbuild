// Refreshes public/data/game.json and the bundled icons.
//   node scripts/update-data.mjs
// - roster + Spanish names : official Wild Rift site (es-mx)
// - patch label            : latest "Patch Notes X.Y" on the official news page
// - icons                  : Riot Data Dragon (champions, items, runes, spells), only files that are missing
// Build templates (public/data/game.json -> builds/items) are curated by hand: nothing public tells us the meta.
import { shrink } from './optimize-images.mjs'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'

const ROOT = new URL('../public/', import.meta.url)
const GAME_FILE = new URL('data/game.json', ROOT)
const game = JSON.parse(readFileSync(GAME_FILE, 'utf8'))
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '')
const j = async url => (await fetch(url)).json()
const text = async url => (await fetch(url)).text()
const nextData = html => JSON.parse(html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s)[1])
let changed = false

// ── Official roster (slug -> es-mx title) ─────────────────────────────────────
async function roster(locale) {
  const d = nextData(await text(`https://wildrift.leagueoflegends.com/${locale}/champions/`))
  const grid = d.props.pageProps.page.blades.find(b => b.type === 'characterCardGrid')
  return Object.fromEntries(grid.items.map(i => [i.action.payload.url.split('/').filter(Boolean).pop(), i.title]))
}
const [en, es] = await Promise.all([roster('en-us'), roster('es-mx')])

// ── Data Dragon ───────────────────────────────────────────────────────────────
const [ver] = await j('https://ddragon.leagueoflegends.com/api/versions.json')
const dd = `https://ddragon.leagueoflegends.com/cdn/${ver}`
const [champs, items, spells, runes] = await Promise.all([
  j(`${dd}/data/en_US/champion.json`), j(`${dd}/data/en_US/item.json`),
  j(`${dd}/data/en_US/summoner.json`), j(`${dd}/data/en_US/runesReforged.json`),
])
const ddByName = Object.fromEntries(Object.values(champs.data).map(c => [norm(c.name), c]))

// ── New champions ─────────────────────────────────────────────────────────────
const TYPE = { Fighter: 'fighter', Mage: 'mage', Assassin: 'assassin', Marksman: 'marksman', Tank: 'tank', Support: 'support' }
const LANE = { fighter: ['Solo'], mage: ['Mid'], assassin: ['Mid'], marksman: ['ADC'], tank: ['Solo'], support: ['Support'] }
const known = new Set(game.champions.map(c => norm(c.n)))
const added = []
for (const [slug, titleEs] of Object.entries(es)) {
  const title = (en[slug] ?? titleEs)
  let name = titleEs.replace(/\w[\w']*/g, w => w[0] + w.slice(1).toLowerCase()).replace(/\bIv\b/, 'IV').replace(/\bY\b/, 'y')
  if (known.has(norm(name)) || known.has(norm(title))) continue
  const meta = ddByName[norm(title)] ?? ddByName[norm(name)]
  if (meta && norm(meta.name) === norm(name)) name = meta.name // official casing, e.g. Cho'Gath
  const t = TYPE[meta?.tags?.[0]] ?? 'fighter'
  const d = meta && meta.info.magic > meta.info.attack ? 'ap' : 'ad'
  // roles/damage are derived from Data Dragon tags: review them by hand when a new champion lands
  game.champions.push({ n: name, r: LANE[t], t, d, auto: true })
  added.push(name)
}
if (added.length) { game.champions.sort((a, b) => a.n.localeCompare(b.n)); changed = true }

// ── Patch label ───────────────────────────────────────────────────────────────
const news = await text('https://wildrift.leagueoflegends.com/en-us/news/game-updates/')
const patches = [...news.matchAll(/Patch Notes (\d+\.\d+[a-z]?)/g)].map(m => m[1])
patches.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
const patch = patches.at(-1)
if (patch && patch !== game.patch) { game.patch = patch; changed = true }

// ── Icons (download only what is missing) ─────────────────────────────────────
async function save(dir, file, url) {
  const out = new URL(`${dir}/${file}`, ROOT)
  if (existsSync(out)) return false
  const r = await fetch(url)
  if (!r.ok) return false
  mkdirSync(new URL(`${dir}/`, ROOT), { recursive: true })
  writeFileSync(out, await shrink(Buffer.from(await r.arrayBuffer())))
  return true
}
const got = { champs: 0, items: 0, runes: 0, spells: 0 }
for (const c of game.champions) {
  const meta = ddByName[norm(game.en[c.n] ?? c.n)] ?? ddByName[norm(c.n)] ?? (c.n === 'Nunu y Willump' ? champs.data.Nunu : null)
  if (meta && await save('champs', `${norm(c.n)}.png`, `${dd}/img/champion/${meta.image.full}`)) got.champs++
}
const ddItem = Object.fromEntries(Object.entries(items.data).filter(([, i]) => i.maps?.['11'] !== false).map(([id, i]) => [norm(i.name), id]))   // skip Arena-only duplicates
for (const [es_, it] of Object.entries(game.items)) {
  const id = ddItem[norm(game.en[es_] ?? es_)]
  if (id && await save('items', `${it.en}.png`, `${dd}/img/item/${id}.png`)) got.items++
}
const ddSpell = Object.fromEntries(Object.values(spells.data).map(s => [norm(s.name), s.image.full]))
for (const n of ['Flash', 'Ignite', 'Smite', 'Exhaust', 'Heal', 'Barrier', 'Cleanse', 'Ghost', 'Teleport']) {
  if (ddSpell[norm(n)] && await save('spells', `${norm(n)}.png`, `${dd}/img/spell/${ddSpell[norm(n)]}`)) got.spells++
}
const ddRune = {}
for (const tree of runes) for (const slot of tree.slots) for (const r of slot.runes) ddRune[norm(r.name)] = r.icon
const used = new Set(Object.values(game.builds).flatMap(b => [b.ks, ...b.runas.map(r => r.n)]))
for (const n of used) {
  const eng = game.en[n] ?? n
  const icon = ddRune[norm(eng)]
  if (icon && await save('runes', `${norm(eng)}.png`, `https://ddragon.leagueoflegends.com/cdn/img/${icon}`)) got.runes++
}

if (changed) { game.version = new Date().toISOString().slice(0, 10); writeFileSync(GAME_FILE, JSON.stringify(game, null, 1) + '\n') }
console.log(JSON.stringify({ changed, patch: game.patch, added, downloaded: got, ddragon: ver }))
