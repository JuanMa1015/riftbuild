import { AI_PROVIDERS } from '../store'
import { buildLocalBuild, ITEMS, groupsOf, rivalTags } from '../data/builds'
import { GAME } from '../data/game'
import { CHAMPIONS } from '../data/champions'
import { makeTr } from '../i18n'

const HINT_LBL = { ap: 'mucho AP', ad: 'mucho AD', heal: 'mucha curación', cc: 'mucho CC', tank: 'muchos tanques' }

// Instant, offline, synchronous — used for live updates as the user taps
export function localBuild({ myChamp, myRole, allies, enemies, hints, lang = 'es' }) {
  const cData     = CHAMPIONS.find(c => c.n === myChamp)
  const enemyList = enemies.filter(Boolean).map(e => ({ name: e.name, data: CHAMPIONS.find(c => c.n === e.name) || null }))
  const allyList  = allies.filter(Boolean).map(a => ({ name: a.name, data: CHAMPIONS.find(c => c.n === a.name) || null }))
  return buildLocalBuild(cData, myRole, enemyList, allyList, hints, makeTr(lang))
}

// ── AI refinement ──────────────────────────────────────────────────────────────
// The model only chooses from OUR item list, so every item has a name, an icon and a translation.
// Runes, spells and skill order stay from the local engine. Short output = cheap calls.
const BOOTS = Object.keys(ITEMS).filter(k => ITEMS[k].t === 'Botas')
const ANS_LBL = { heal: 'curación', shield: 'escudos', hp: 'tanques/armadura', ap: 'daño mágico', ad: 'daño físico', cc: 'control', burst: 'daño explosivo' }
// only items this kind of champion can use, so the model does not hand an assassin a tank item
const gearFor = groups => Object.keys(ITEMS).filter(k => ITEMS[k].t !== 'Botas' && (ITEMS[k].fit || []).some(g => groups.has(g)))

const traitLine = enemies => enemies.map(e => `${e.name}: ${[...rivalTags(e.name, CHAMPIONS.find(c => c.n === e.name))].map(t => ANS_LBL[t]).join('/') || 'sin rasgo especial'}`).join('; ') || 'ninguno'
const answers = gear => gear.filter(k => ITEMS[k].ans?.length).map(k => `${k} → ${ITEMS[k].ans.map(t => ANS_LBL[t]).join('/')}`).join('; ')

function makePrompt({ myChamp, myRole, allies, enemies, hints = {}, lang, base, gear }) {
  const hp = Object.keys(HINT_LBL).filter(k => hints[k]).map(k => HINT_LBL[k]).join(', ')
  const list = a => a.map(x => `${x.lane}:${x.name}`).join(', ') || 'ninguno'
  const out = lang === 'en' ? 'inglés' : 'español latinoamericano'
  return `Wild Rift, parche ${GAME.patch}. Mejora la build de ${myChamp} (${myRole}) contra estos rivales: ${list(enemies)}${hp ? ` (${hp})` : ''}. Aliados: ${list(allies)}.
Build base del motor: ${base.items.join(', ')} | botas ${base.boots}.
Rasgos de los rivales (lo que traen): ${traitLine(enemies)}.
Elige 5 ítems distintos (el sexto espacio son las botas) SOLO de esta lista, en orden de compra: ${gear.join(' | ')}.
Los 2 primeros ítems de la build base son el núcleo del campeón: consérvalos. Los otros 3 deben responder a lo que traen los rivales (curación → anti-curación, escudos → rompe-escudos, tanques → penetración, mucho daño mágico o físico → resistencias, control → limpieza). Qué responde cada ítem situacional: ${answers(gear)}.
En "w" nombra a los rivales que justifican cada ítem.
Botas SOLO de: ${BOOTS.join(' | ')}.
Responde SOLO JSON sin backticks: {"items":[{"n":"nombre exacto de la lista","w":"máx 14 palabras: por qué contra ESTOS rivales"}],"boots":"nombre exacto","tip":"máx 30 palabras, consejo para esta partida","coach":{"pick":"máx 22 palabras: ¿conviene ${myChamp} contra esta composición? si no, qué campeón del carril sería mejor","threat":"máx 22 palabras: la mayor amenaza del equipo rival y cómo responderle","lane":"máx 22 palabras: cómo jugar tu carril","watch":"máx 22 palabras: qué vigilar en la partida"}}
Si aún faltan rivales, razona con lo que hay. Los textos "w", "tip" y "coach" en ${out}. Los nombres de ítems se copian tal cual de la lista.`
}

async function ask({ provider, key, model, prompt, signal }) {
  const cfg = AI_PROVIDERS[provider]
  const m = model || cfg.models[0]
  const post = (headers, body) => fetch(cfg.url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body), signal })
  let resp
  if (provider === 'anthropic') {
    resp = await post(
      // the browser-access header is required for calls made from a WebView
      { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      { model: m, max_tokens: 1000, temperature: 0.2, messages: [{ role: 'user', content: prompt }] })
  } else {
    const or = provider === 'openrouter'
    resp = await post(
      { Authorization: `Bearer ${key}`, ...(or ? { 'HTTP-Referer': 'https://riftbuild.app', 'X-Title': 'RiftBuild' } : {}) },
      {
        model: m, temperature: 0.2, messages: [{ role: 'user', content: prompt }],
        // measured with a real key: with reasoning ON, Nemotron Ultra thought for 30-70 s and ran out of tokens before the JSON.
        // Nemotron Super with reasoning OFF answers in ~10 s with valid JSON, so reasoning is switched off.
        max_tokens: 1100,
        ...(or ? { reasoning: { enabled: false } } : {}),
        // the free Nemotron endpoint is pinned to NVIDIA, as in OpenRouter's own example
        ...(or && m.startsWith('nvidia/') ? { provider: { only: ['nvidia'], allow_fallbacks: false } } : {}),
      })
  }
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok || data.error) throw Object.assign(new Error(data.error?.message || `HTTP ${resp.status}`), { status: resp.status })
  const text = (provider === 'anthropic' ? data.content.map(b => b.text || '').join('') : data.choices?.[0]?.message?.content) || ''
  const json = text.match(/\{[\s\S]*\}/)?.[0]
  if (!json) throw new Error('El modelo no devolvió JSON (¿se quedó sin tokens pensando?)')
  return JSON.parse(json)
}

// Settings > "Test key": one tiny call, so a wrong key or an empty balance is explained instead of failing later in a match
export async function testKey({ provider, key, model }) {
  const cfg = AI_PROVIDERS[provider]
  try {
    await ask({ provider, key, model: cfg.models.includes(model) ? model : cfg.models[0], prompt: 'Responde SOLO este JSON: {"ok":true}' })
    return 'ok'
  } catch (e) {
    if (e.status === 401 || e.status === 403) return 'bad'
    if (e.status === 402 || e.status === 429) return 'quota'
    return e.status ? 'error' : 'net'
  }
}

// Same question twice costs nothing: answers are cached on the device.
const CACHE_KEY = 'wr-ai-cache'
const readCache = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {} } catch { return {} } }
function writeCache(k, v) {
  try {
    const c = readCache(); c[k] = v
    const keys = Object.keys(c); if (keys.length > 40) delete c[keys[0]]
    localStorage.setItem(CACHE_KEY, JSON.stringify(c))
  } catch { /* storage blocked */ }
}

export async function generateBuild({ myChamp, myRole, allies, enemies, hints, lang, provider, key, model, signal }) {
  const base = localBuild({ myChamp, myRole, allies, enemies, hints, lang })
  if (provider === 'local' || !key?.trim()) return base

  const cfg = AI_PROVIDERS[provider]
  const m = cfg.models.includes(model) ? model : cfg.models[0]   // a stale saved model falls back to the default
  const ck = JSON.stringify(['v3', GAME.patch, lang, m, myChamp, myRole, allies.map(a => a.name).sort(), enemies.map(e => e.name).sort(), hints])
  let ans = readCache()[ck]
  if (!ans) {
    const es = localBuild({ myChamp, myRole, allies, enemies, hints, lang: 'es' }) // canonical names for the prompt
    ans = await ask({
      provider, key, model: m, signal,
      prompt: makePrompt({ myChamp, myRole, allies, enemies, hints, lang, base: { items: es.build.map(b => b.nombre), boots: es.botas.nombre }, gear: gearFor(groupsOf(CHAMPIONS.find(c => c.n === myChamp), myRole)) }),
    })
    writeCache(ck, ans)
  }

  const tr = makeTr(lang)
  const seen = new Set()
  const items = (ans.items || []).filter(i => ITEMS[i.n] && ITEMS[i.n].t !== 'Botas' && !seen.has(i.n) && seen.add(i.n)).slice(0, 5)
    .map(i => ({ nombre: tr(i.n), en: ITEMS[i.n].en, tipo: ITEMS[i.n].t, por_que: i.w || tr(ITEMS[i.n].desc) }))
  if (items.length < 4) throw new Error('La IA no devolvió ítems válidos')

  const out = { ...base, build: items }
  if (ITEMS[ans.boots]?.t === 'Botas') out.botas = { ...base.botas, nombre: tr(ans.boots), en: ITEMS[ans.boots].en, por_que: tr(ITEMS[ans.boots].desc) }
  if (ans.tip) out.consejo = ans.tip
  // coach notes: plain short strings only, whatever else the model sent is dropped
  if (ans.coach && typeof ans.coach === 'object') {
    const c = {}
    for (const k of ['pick', 'threat', 'lane', 'watch']) if (typeof ans.coach[k] === 'string' && ans.coach[k].trim()) c[k] = ans.coach[k].trim().slice(0, 220)
    if (Object.keys(c).length) out.coach = c
  }
  return out
}
