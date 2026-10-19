import { AI_PROVIDERS } from '../store'
import { buildLocalBuild, ITEMS } from '../data/builds'
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
const GEAR  = Object.keys(ITEMS).filter(k => ITEMS[k].t !== 'Botas')

function makePrompt({ myChamp, myRole, allies, enemies, hints = {}, lang, base }) {
  const hp = Object.keys(HINT_LBL).filter(k => hints[k]).map(k => HINT_LBL[k]).join(', ')
  const list = a => a.map(x => `${x.lane}:${x.name}`).join(', ') || 'ninguno'
  const out = lang === 'en' ? 'inglés' : 'español latinoamericano'
  return `Wild Rift, parche ${GAME.patch}. Mejora la build de ${myChamp} (${myRole}) contra estos rivales: ${list(enemies)}${hp ? ` (${hp})` : ''}. Aliados: ${list(allies)}.
Build base del motor: ${base.items.join(', ')} | botas ${base.boots}.
Elige 5 ítems distintos (el sexto espacio son las botas) SOLO de esta lista, en orden de compra: ${GEAR.join(' | ')}.
Botas SOLO de: ${BOOTS.join(' | ')}.
Responde SOLO JSON sin backticks: {"items":[{"n":"nombre exacto de la lista","w":"máx 14 palabras: por qué contra ESTOS rivales"}],"boots":"nombre exacto","tip":"máx 30 palabras, consejo para esta partida"}
Los textos "w" y "tip" en ${out}. Los nombres de ítems se copian tal cual de la lista.`
}

async function ask({ provider, key, model, prompt }) {
  const cfg = AI_PROVIDERS[provider]
  const m = model || cfg.models[0]
  const post = (headers, body) => fetch(cfg.url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) })
  let resp
  if (provider === 'anthropic') {
    resp = await post(
      // the browser-access header is required for calls made from a WebView
      { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      { model: m, max_tokens: 700, temperature: 0.2, messages: [{ role: 'user', content: prompt }] })
  } else {
    const or = provider === 'openrouter'
    resp = await post(
      { Authorization: `Bearer ${key}`, ...(or ? { 'HTTP-Referer': 'https://riftbuild.app', 'X-Title': 'RiftBuild' } : {}) },
      {
        model: m, temperature: 0.2, messages: [{ role: 'user', content: prompt }],
        // measured with a real key: with reasoning ON, Nemotron Ultra thought for 30-70 s and ran out of tokens before the JSON.
        // Nemotron Super with reasoning OFF answers in ~10 s with valid JSON, so reasoning is switched off.
        max_tokens: 800,
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

export async function generateBuild({ myChamp, myRole, allies, enemies, hints, lang, provider, key, model }) {
  const base = localBuild({ myChamp, myRole, allies, enemies, hints, lang })
  if (provider === 'local' || !key?.trim()) return base

  const cfg = AI_PROVIDERS[provider]
  const m = cfg.models.includes(model) ? model : cfg.models[0]   // a stale saved model falls back to the default
  const ck = JSON.stringify([GAME.patch, lang, m, myChamp, myRole, allies.map(a => a.name).sort(), enemies.map(e => e.name).sort(), hints])
  let ans = readCache()[ck]
  if (!ans) {
    const es = localBuild({ myChamp, myRole, allies, enemies, hints, lang: 'es' }) // canonical names for the prompt
    ans = await ask({
      provider, key, model: m,
      prompt: makePrompt({ myChamp, myRole, allies, enemies, hints, lang, base: { items: es.build.map(b => b.nombre), boots: es.botas.nombre } }),
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
  return out
}
