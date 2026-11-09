import game from '../public/data/game.json' with { type: 'json' }

const champions = new Set(game.champions.map(champion => champion.n))
const lanes = ['Top', 'Jungla', 'Mid', 'ADC', 'Supp']
const roleLane = { 'Solo / Baron': 'Top', Jungla: 'Jungla', Mid: 'Mid', 'ADC / Duo': 'ADC', Support: 'Supp' }
const hints = ['ap', 'ad', 'heal', 'cc', 'tank']
const fields = ['lane', 'threat', 'watch', 'fights', 'objectives']
const DAY = 86400000

function normalize(input) {
  if (!input || !champions.has(input.myChamp) || !Object.hasOwn(roleLane, input.myRole)
    || !['es', 'en'].includes(input.lang)) return null
  const draft = { myChamp: input.myChamp, myRole: input.myRole, lang: input.lang }
  for (const side of ['allies', 'enemies']) {
    const team = input[side]
    if (!Array.isArray(team) || team.length > 5) return null
    const byLane = new Map()
    for (const slot of team) {
      if (!slot || !lanes.includes(slot.lane) || byLane.has(slot.lane)
        || !champions.has(slot.name)) return null
      byLane.set(slot.lane, slot.name)
    }
    draft[side] = lanes.flatMap(lane => byLane.has(lane) ? [[lane, byLane.get(lane)]] : [])
  }
  draft.hints = hints.filter(hint => input.hints?.[hint] === true)
  return draft
}

function coachNotes(content) {
  const parsed = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || '{}')
  if (!fields.every(key => typeof parsed[key] === 'string' && parsed[key].trim())) return null
  return Object.fromEntries(fields.map(key => [key, parsed[key].trim().slice(0, 220)]))
}

async function ask(env, draft) {
  const direct = draft.enemies.find(([lane]) => lane === roleLane[draft.myRole])?.[1] ?? null
  const prompt = `Wild Rift patch ${game.patch}. Draft: ${JSON.stringify(draft)}.
Write in ${draft.lang === 'es' ? 'Latin American Spanish' : 'English'}.
Direct opponent: ${JSON.stringify(direct)}. Return only JSON with five strings, max 20 words each.
lane: one practical early-game action for the player's role against the direct opponent; if missing, give role-specific advice.
threat: the biggest known team threat. watch: a concrete response to that team threat.
fights: positioning in team fights. objectives: setup around objectives for this composition.
Use only listed opponents. No skill letters, ability effects, numbers, or claims about current game state. Prefer spacing, wave control, vision and timing.`
  const providers = [
    ['groq', env.GROQ_API_KEY, 'https://api.groq.com/openai/v1/chat/completions', 'openai/gpt-oss-120b', { reasoning_effort: 'low', max_completion_tokens: 1200 }],
    ['gemini', env.GEMINI_API_KEY, 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', 'gemini-3.1-flash-lite', { max_tokens: 650 }],
    ['openrouter', env.OPENROUTER_API_KEY, 'https://openrouter.ai/api/v1/chat/completions', 'google/gemma-4-26b-a4b-it:free', { max_tokens: 650 }],
  ]
  for (const [via, key, url, model, limits] of providers) {
    if (!key) continue
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], ...limits }),
        signal: AbortSignal.timeout(4500),
      })
      if (!response.ok) {
        console.warn('coach_provider_http', via, response.status)
        continue
      }
      const data = await response.json()
      const coach = coachNotes(data.choices?.[0]?.message?.content || '')
      if (coach) return { coach, via }
      console.warn('coach_provider_invalid', via)
    } catch (error) {
      console.warn('coach_provider_error', via, error?.name)
    }
  }
  return null
}

export class Quota {
  constructor(state) {
    this.sql = state.storage.sql
    this.sql.exec('CREATE TABLE IF NOT EXISTS counts (key TEXT PRIMARY KEY, n INTEGER, expires INTEGER)')
  }

  async fetch(request) {
    const { client } = await request.json()
    const now = Date.now()
    const day = Math.floor(now / DAY)
    const minute = Math.floor(now / 60000)
    this.sql.exec('DELETE FROM counts WHERE expires <= ?', now)
    const limits = [
      [`client:${day}:${client}`, 12, (day + 1) * DAY, 'client_daily'],
      [`day:${day}`, 200, (day + 1) * DAY, 'global_daily'],
      [`minute:${minute}`, 8, (minute + 1) * 60000, 'global_minute'],
    ]
    for (const [key, max, expires, scope] of limits) {
      const count = this.sql.exec('SELECT n FROM counts WHERE key = ?', key).toArray()[0]?.n || 0
      if (count >= max) return Response.json({ scope, retryAt: expires }, { status: 429 })
    }
    for (const [key, , expires] of limits) {
      this.sql.exec('INSERT INTO counts VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET n = n + 1', key, expires)
    }
    return new Response(null, { status: 204 })
  }
}

async function hash(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

async function readDraft(request) {
  const reader = request.body?.getReader()
  if (!reader) return null
  const decoder = new TextDecoder()
  let size = 0
  let body = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > 4096) {
      await reader.cancel()
      return null
    }
    body += decoder.decode(value, { stream: true })
  }
  return normalize(JSON.parse(body + decoder.decode()))
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')
    const allowed = env.COACH_ORIGINS.split(',').map(value => value.trim())
    if (url.pathname !== '/coach') return new Response(null, { status: 404 })
    if (!allowed.includes(origin)) return new Response(null, { status: 403 })
    const headers = { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      ...headers, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type',
    } })
    if (request.method !== 'POST') return new Response(null, { status: 405, headers })

    const draft = await readDraft(request).catch(() => null)
    if (!draft) return new Response(null, { status: 400, headers })
    const cacheKey = new Request(`${url.origin}/cache/${await hash(JSON.stringify(['v2', game.version, draft]))}`)
    const cached = await caches.default.match(cacheKey)
    if (cached) return Response.json(await cached.json(), { headers })

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const client = await hash(`${Math.floor(Date.now() / DAY)}:${ip}`)
    const quota = env.QUOTA.get(env.QUOTA.idFromName('shared'))
    const permit = await quota.fetch('https://quota.internal/', { method: 'POST', body: JSON.stringify({ client }) })
    if (permit.status === 429) {
      const limit = await permit.json()
      console.warn('coach_quota', limit.scope)
      return Response.json(limit, { status: 429, headers })
    }
    if (!permit.ok) return new Response(null, { status: 503, headers })
    const result = await ask(env, draft)
    if (!result) return new Response(null, { status: 503, headers })
    ctx.waitUntil(caches.default.put(cacheKey, Response.json(result, { headers: { 'Cache-Control': 'public, max-age=3600' } })))
    return Response.json(result, { headers })
  },
}
