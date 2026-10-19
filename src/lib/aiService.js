import { AI_PROVIDERS } from '../store'
import { buildLocalBuild } from '../data/builds'
import { GAME } from '../data/game'
import { CHAMPIONS } from '../data/champions'
import { makeTr } from '../i18n'

const HINT_LBL = { ap:"mucho AP", ad:"mucho AD", heal:"mucha curación", cc:"mucho CC", tank:"muchos tanques" }

function makePrompt(champName, role, allies, enemies, hints = {}, lang = 'es') {
  const hp = Object.keys(HINT_LBL).filter(k => hints[k]).map(k => HINT_LBL[k]).join(", ")
  const ap = allies.filter(Boolean).map(a=>`${a.lane}:${a.name}`).join(",") || "ninguno"
  const ep = enemies.filter(Boolean).map(e=>`${e.lane}:${e.name}`).join(",") || "ninguno"
  return `Eres experto en Wild Rift patch ${GAME.patch}. Responde SOLO con JSON válido, sin texto extra ni backticks. Idioma de todos los textos: ${lang === 'en' ? 'inglés (nombres oficiales de ítems en inglés)' : 'español latinoamericano'}.

Campeón: ${champName} | Carril: ${role}
Aliados: ${ap}
Enemigos: ${ep}${hp ? `\nEquipo enemigo tiene: ${hp}` : ""}

JSON exacto:
{"campeon":"nombre","carril":"${role}","amenazas":["amenaza1"],"sinergias":["sinergia1"],"build":[{"nombre":"Nombre ítem español WR","en":"slug-ingles","tipo":"Ofensivo|Defensivo|Híbrido|Botas","por_que":"1-2 oraciones específicas para ESTOS rivales"}],"botas":{"nombre":"nombre español","en":"slug","encantamiento":"nombre","por_que":"razón"},"runas":[{"slot":"Keystone","n":"nombre","p":"razón"},{"slot":"Slot 1","n":"nombre","p":"razón"},{"slot":"Slot 2","n":"nombre","p":"razón"},{"slot":"Slot 3","n":"nombre","p":"razón"},{"slot":"Slot 4","n":"nombre","p":"razón"}],"hechizos":["Flash","Ignite"],"orden_habilidades":"R > Q > E > W","skillNote":"razón breve","consejo":"consejo táctico clave para ESTA partida"}

6 ítems exactos. Nombres reales de Wild Rift en español latinoamericano.`
}

async function parseResponse(resp, provider) {
  const data = await resp.json()
  if (provider === 'anthropic') {
    if (data.error) throw new Error(data.error.message)
    const text = data.content.map(b => b.text||"").join("").replace(/```json|```/g,"").trim()
    return JSON.parse(text)
  }
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error))
  return JSON.parse(data.choices[0].message.content.replace(/```json|```/g,"").trim())
}

// Instant, offline, synchronous — used for live updates as the user taps
export function localBuild({ myChamp, myRole, allies, enemies, hints, lang = 'es' }) {
  const cData     = CHAMPIONS.find(c => c.n === myChamp)
  const enemyList = enemies.filter(Boolean).map(e => ({ name:e.name, data:CHAMPIONS.find(c=>c.n===e.name)||null }))
  const allyList  = allies.filter(Boolean).map(a  => ({ name:a.name, data:CHAMPIONS.find(c=>c.n===a.name)||null }))
  return buildLocalBuild(cData, myRole, enemyList, allyList, hints, makeTr(lang))
}

export async function generateBuild({ myChamp, myRole, allies, enemies, hints, lang, provider, key, model }) {
  if (provider === 'local' || !key?.trim()) return localBuild({ myChamp, myRole, allies, enemies, hints, lang })

  // ── AI mode ──────────────────────────────────────────
  const cfg    = AI_PROVIDERS[provider]
  const prompt = makePrompt(myChamp, myRole, allies, enemies, hints, lang)
  let resp

  if (provider === 'anthropic') {
    resp = await fetch(cfg.url, {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-api-key":key, "anthropic-version":"2023-06-01" },
      body: JSON.stringify({ model: model||cfg.models[0], max_tokens:1400, messages:[{role:"user",content:prompt}] })
    })
  } else if (provider === 'openrouter') {
    resp = await fetch(cfg.url, {
      method: "POST",
      headers: { "Content-Type":"application/json", "Authorization":`Bearer ${key}`, "HTTP-Referer":"https://wildrift-advisor.local", "X-Title":"Wild Rift Build Advisor" },
      body: JSON.stringify({ model: model||cfg.models[0], messages:[{role:"user",content:prompt}] })
    })
  } else {
    resp = await fetch(cfg.url, {
      method: "POST",
      headers: { "Content-Type":"application/json", "Authorization":`Bearer ${key}` },
      body: JSON.stringify({ model: model||cfg.models[0], messages:[{role:"user",content:prompt}] })
    })
  }

  const build = await parseResponse(resp, provider)

  // Normalize tag format from AI strings to {l, cls} objects
  if (build.amenazas?.length && typeof build.amenazas[0] === "string")
    build.amenazas = build.amenazas.map(a => ({ l:a, cls:"tag-r" }))
  if (build.sinergias?.length && typeof build.sinergias[0] === "string")
    build.sinergias = build.sinergias.map(s => ({ l:s, cls:"tag-g" }))

  return build
}
