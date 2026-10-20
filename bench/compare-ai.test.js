// Compares the AI providers/models on the same matches, through the real code path (generateBuild), and ranks them.
//   PowerShell:  $env:GROQ_API_KEY = Read-Host "Clave de Groq"; $env:OPENROUTER_API_KEY = Read-Host "Clave de OpenRouter"; npm run compare:ai
// Keys come only from environment variables of that terminal: nothing is written to disk. Providers without a key are skipped.
// The models tested are the ones each provider really offers for that key (best candidates first, BENCH_PER_PROVIDER of each, default 3).
// BENCH_MODELS=gpt-oss,gemma limits the run to models whose id contains any of those words.
// BENCH_PREFLIGHT=1 only checks the connection and lists the models. BENCH_MOCK=1 runs the harness against a fake answer.
import { it, vi, expect } from 'vitest'
import { writeFileSync, mkdirSync } from 'node:fs'
import { generateBuild, listModels, localBuild, resetPauses } from '../src/lib/aiService'
import { ITEMS, groupsOf, fixedCount, neededTags } from '../src/data/builds'
import { CHAMPIONS } from '../src/data/game'
import { AI_PROVIDERS } from '../src/store'

const MOCK = !!process.env.BENCH_MOCK
const ENV = { anthropic: 'ANTHROPIC_API_KEY', openrouter: 'OPENROUTER_API_KEY', groq: 'GROQ_API_KEY', openai: 'OPENAI_API_KEY' }
const SLEEP = +(process.env.BENCH_SLEEP_MS || 3000)         // pause between calls: free tiers limit tokens per minute
const CALL_TIMEOUT = +(process.env.BENCH_TIMEOUT_MS || 90000) // a call that hangs counts as a failure instead of stalling the run
const PER_PROVIDER = +(process.env.BENCH_PER_PROVIDER || 3)
const ONLY = (process.env.BENCH_MODELS || '').split(',').map(x => x.trim()).filter(Boolean)

const E = (...n) => n.map(name => ({ lane: '', name }))
const SCENARIOS = [
  { id: 'Gwen top vs curación y escudos', champ: 'Gwen', role: 'Solo / Baron', foes: ['Sett', 'Mel', 'Dr. Mundo', 'Caitlyn', 'Lux'], mates: ['Nasus', 'Jinx', 'Pyke', 'Hwei'] },
  { id: 'Jinx vs apoyos con escudos', champ: 'Jinx', role: 'ADC / Duo', foes: ['Janna', 'Lulu', 'Leona', 'Soraka', 'Zed'], mates: [] },
  { id: 'Ahri vs asesinos y curación', champ: 'Ahri', role: 'Mid', foes: ['Soraka', 'Zed', 'Yasuo', 'Jinx', 'Leona'], mates: [] },
  { id: 'Malphite vs todo AD', champ: 'Malphite', role: 'Solo / Baron', foes: ['Jinx', 'Zed', 'Yasuo', 'Darius', 'Vayne'], mates: [] },
  { id: 'Zed vs tanques y escudos', champ: 'Zed', role: 'Mid', foes: ['Malphite', 'Ornn', 'Sion', 'Dr. Mundo', 'Janna'], mates: [] },
  { id: 'Leona support vs todo AP', champ: 'Leona', role: 'Support', foes: ['Ahri', 'Syndra', 'Lux', 'Annie', 'Jinx'], mates: [] },
  { id: 'Garen (sin guía) vs curadores', champ: 'Garen', role: 'Solo / Baron', foes: ['Dr. Mundo', 'Darius', 'Warwick'], mates: [] },
  { id: "Kai'Sa con un solo rival", champ: "Kai'Sa", role: 'ADC / Duo', foes: ['Ashe'], mates: [] },
]

// the engine's own judgement of what the rival team demands: tags a good build must answer
const covered = (names, tags, groups) =>
  tags.filter(t => names.some(n => ITEMS[n]?.ans?.includes(t) && ITEMS[n].fit?.some(g => groups.has(g))))

function mockFetch(scn) {
  const b = localBuild({ myChamp: scn.champ, myRole: scn.role, allies: E(...scn.mates), enemies: E(...scn.foes), hints: {}, lang: 'es' })
  const ans = { items: b.build.map(x => ({ n: x.nombre, w: `Contra ${scn.foes[0]}` })), boots: b.botas.nombre, tip: 'x', coach: { pick: 'a', threat: `${scn.foes[0]}`, lane: 'c', watch: 'd' } }
  return async () => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content: JSON.stringify(ans) } }], content: [{ text: JSON.stringify(ans) }] }) })
}

const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0 }
const pct = x => `${Math.round(100 * x)}%`
const sleep = ms => new Promise(r => setTimeout(r, ms))
const log = (...a) => console.log(...a)

// Why Node could not reach a provider (the browser and the app are a different network path from Node)
const HELP = {
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: 'Un antivirus o proxy intercepta HTTPS. Prueba: $env:NODE_OPTIONS="--use-system-ca"',
  SELF_SIGNED_CERT_IN_CHAIN: 'Un antivirus o proxy intercepta HTTPS. Prueba: $env:NODE_OPTIONS="--use-system-ca"',
  ETIMEDOUT: 'Se agota la conexión: suele ser IPv6 o un proxy. Prueba: $env:NODE_OPTIONS="--dns-result-order=ipv4first"',
  UND_ERR_CONNECT_TIMEOUT: 'Se agota la conexión: suele ser IPv6 o un proxy. Prueba: $env:NODE_OPTIONS="--dns-result-order=ipv4first"',
  ENOTFOUND: 'No resuelve el nombre (DNS). Revisa tu internet o cambia de red.',
  EAI_AGAIN: 'No resuelve el nombre (DNS). Revisa tu internet o cambia de red.',
  ECONNRESET: 'Algo corta la conexión (antivirus, firewall o VPN). Prueba sin VPN o desde otra red.',
}
const whyOf = e => e?.cause?.code || e?.cause?.message || e?.message || String(e)
// an error that will not fix itself in a few seconds: stop wasting calls on that model
const hard = e => [401, 402, 403, 404].includes(e?.status) || /free-models-per-day|does not exist|no longer|decommission/i.test(e?.message || '')

// which models to test: what each provider really offers for the key, best candidates first
async function discover() {
  if (MOCK) return [['anthropic', 'claude-haiku-5-5'], ['groq', 'llama-3.3-70b-versatile'], ['openrouter', 'nvidia/nemotron-3-super-120b-a12b:free']]
  const out = []
  for (const p of Object.keys(ENV)) {
    const key = process.env[ENV[p]]
    if (!key) continue
    const origin = new URL(AI_PROVIDERS[p].url).origin
    try {
      const ids = await listModels({ provider: p, key, signal: AbortSignal.timeout(20000) })
      log(`${origin}: responde. Modelos de chat disponibles con tu clave (${ids.length}): ${ids.slice(0, 12).join(', ')}${ids.length > 12 ? '…' : ''}`)
      const pick = ids.filter(id => !ONLY.length || ONLY.some(o => id.includes(o))).slice(0, PER_PROVIDER)
      for (const id of pick) out.push([p, id])
    } catch (e) {
      const why = e.status ? `HTTP ${e.status}` : whyOf(e)
      log(`${origin}: NO se pudo leer (${why})${HELP[whyOf(e)] ? `\n   → ${HELP[whyOf(e)]}` : e.status === 401 ? ' — la clave no es válida' : ''}`)
    }
  }
  return out
}

it('compara proveedores y modelos', async () => {
  if (!MOCK && !Object.values(ENV).some(v => process.env[v])) { log('Sin claves: define GROQ_API_KEY y/o OPENROUTER_API_KEY (o BENCH_MOCK=1).'); return }
  const models = await discover()
  if (!models.length) { log('Ningún modelo disponible: no se hicieron llamadas.'); return }
  if (process.env.BENCH_PREFLIGHT) { log(`Se probarían: ${models.map(m => m.join('/')).join(', ')}`); return }
  log(`\nSe probarán ${models.length} modelos con ${SCENARIOS.length} partidas cada uno (${models.length * SCENARIOS.length} llamadas).\n`)

  const line = r => `${r.score.toFixed(0).padStart(3)} | ${(r.provider + '/' + r.model).padEnd(46)} | éxito ${pct(r.ok).padStart(4)} | responde a rivales ${pct(r.cover).padStart(4)} | núcleo ${pct(r.core).padStart(4)} | coach ${pct(r.coach).padStart(4)} | nombra rivales ${pct(r.names).padStart(4)} | mediana ${(r.ms / 1000).toFixed(1)}s p95 ${(r.p95 / 1000).toFixed(1)}s | límite/min ${r.limited ?? 0} de ${r.n}${r.errors.length ? ' | errores: ' + r.errors.join(' / ') : ''}`
  const rows = []
  for (const [provider, model] of models) {
    const res = []
    let hardFails = 0
    for (const scn of SCENARIOS) {
      if (hardFails >= 2) { res.push({ ok: 0, ms: 0, err: res.at(-1).err }); continue }   // same fatal error twice: skip the rest of this model
      localStorage.clear(); resetPauses()   // no cache, no leftover pauses: every call is a real one
      if (MOCK) vi.stubGlobal('fetch', mockFetch(scn))
      const args = { myChamp: scn.champ, myRole: scn.role, allies: E(...scn.mates), enemies: E(...scn.foes), hints: {}, lang: 'es', provider, key: MOCK ? 'mock' : process.env[ENV[provider]], model }
      const champ = CHAMPIONS.find(c => c.n === scn.champ), groups = groupsOf(champ, scn.role)
      const base = localBuild(args), nFix = fixedCount(scn.champ)
      const need = neededTags(scn.foes.map(name => ({ name, data: CHAMPIONS.find(c => c.n === name) })), {})
      let t0 = Date.now(), limited = 0
      let out = null, err = null
      for (let attempt = 0; attempt < 2 && !out; attempt++) {
        try { out = await generateBuild({ ...args, signal: MOCK ? undefined : AbortSignal.timeout(CALL_TIMEOUT) }) } catch (e) {
          err = e
          if (e.status === 429 && !hard(e) && attempt === 0 && !MOCK) { limited++; await sleep(Math.min((e.retryAfter || 20) * 1000 + 500, 65000)); resetPauses(); t0 = Date.now(); continue }   // per-minute limit: wait what it says, retry once
          break
        }
      }
      const ms = Date.now() - t0
      if (!out || !out.via) {
        const why = err ? `${err.status ? 'HTTP ' + err.status + ' ' : ''}${err.name === 'TimeoutError' ? 'tardó más de ' + CALL_TIMEOUT / 1000 + ' s' : whyOf(err)}` : 'sin respuesta de la IA'
        hardFails = err && hard(err) ? hardFails + 1 : 0
        log(`  ✗ ${provider}/${model} · ${scn.id}: ${why}`)
        res.push({ ok: 0, ms, err: why }); if (!MOCK) await sleep(SLEEP); continue
      }
      hardFails = 0
      const names = out.build.map(b => b.nombre), c = out.coach || {}
      const text = JSON.stringify([out.build.map(b => b.por_que), c]).toLowerCase()
      const r = {
        ok: 1, ms, items: names.length,
        core: names.slice(0, nFix).filter((n, i) => n === base.build[i].nombre).length / nFix,
        cover: need.length ? covered(names, need, groups).length / need.length : 1,
        coach: Object.keys(c).length / 4,
        names: scn.foes.some(f => text.includes(f.toLowerCase())) ? 1 : 0, limited,
      }
      log(`  ✓ ${provider}/${model} · ${scn.id}: ${(ms / 1000).toFixed(1)} s${limited ? ' (tras esperar el límite por minuto)' : ''}, responde a ${pct(r.cover)} de lo que traen, núcleo ${pct(r.core)}`)
      res.push(r)
      if (!MOCK) await sleep(SLEEP)
    }
    const ok = res.filter(r => r.ok), avg = k => (ok.length ? ok.reduce((s, r) => s + r[k], 0) / ok.length : 0)
    const row = {
      provider, model, n: res.length, ok: ok.length / res.length, ms: median(ok.map(r => r.ms)), p95: [...ok.map(r => r.ms)].sort((a, b) => a - b).at(Math.max(0, Math.floor(ok.length * 0.95) - 1)) || 0,
      core: avg('core'), cover: avg('cover'), coach: avg('coach'), names: avg('names'), limited: res.filter(r => r.limited).length, errors: [...new Set(res.filter(r => !r.ok).map(r => r.err))].slice(0, 2),
    }
    // 30% reliability, 30% answering what the rivals bring, 20% keeping the champion's core, 10% coach notes, 10% speed (full under 3 s, zero over 15 s)
    row.score = 100 * (0.3 * row.ok + 0.3 * row.cover + 0.2 * row.core + 0.1 * row.coach + 0.1 * Math.max(0, Math.min(1, (15000 - row.ms) / 12000)))
    rows.push(row)
    log(`→ ${line(row)}\n`)
  }

  // reference: the local engine alone (no AI, no network). The AI has to add something on top of this.
  const ref = SCENARIOS.map(scn => {
    const champ = CHAMPIONS.find(c => c.n === scn.champ), groups = groupsOf(champ, scn.role)
    const need = neededTags(scn.foes.map(name => ({ name, data: CHAMPIONS.find(c => c.n === name) })), {})
    const names = localBuild({ myChamp: scn.champ, myRole: scn.role, allies: E(...scn.mates), enemies: E(...scn.foes), hints: {}, lang: 'es' }).build.map(b => b.nombre)
    return need.length ? covered(names, need, groups).length / need.length : 1
  })
  const refCover = ref.reduce((s, x) => s + x, 0) / ref.length
  rows.sort((a, b) => b.score - a.score)
  const report = ['Puntaje | modelo | métricas', ...rows.map(line), `Referencia: el motor local solo responde a ${pct(refCover)} de lo que traen los rivales (sin IA, 0 s, sin coach).`].join('\n')
  log('\n===== RESULTADO FINAL =====\n' + report + '\n')
  mkdirSync('bench/out', { recursive: true })
  writeFileSync(`bench/out/compare-${new Date().toISOString().slice(0, 16).replace(':', '')}${MOCK ? '-mock' : ''}.txt`, report + '\n')
  expect(rows.length).toBeGreaterThan(0)
}, 40 * 60_000)
