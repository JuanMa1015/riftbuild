// Asks an LLM which build templates the latest patch notes justify changing, validates the answer
// against the item list, and writes the proposal into public/data/game.json. A human reviews the PR.
//   OPENROUTER_API_KEY=... node scripts/propose-builds.mjs digest.md
// Writes proposal.md next to it. Prints nothing and changes nothing when the model proposes nothing valid.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const [digestPath] = process.argv.slice(2)
const key = process.env.OPENROUTER_API_KEY
const MODEL = process.env.PROPOSE_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free'
if (!digestPath || !existsSync(digestPath) || !key) process.exit(0)

const file = new URL('../public/data/game.json', import.meta.url)
const game = JSON.parse(readFileSync(file, 'utf8'))
const digest = readFileSync(digestPath, 'utf8')
const gear = Object.keys(game.items).filter(k => game.items[k].t !== 'Botas')

const current = Object.fromEntries(Object.entries(game.builds).map(([a, b]) => [a, { core: b.core, sit: b.sit }]))
const prompt = `Wild Rift build templates (item names in Spanish, exactly as listed).
Patch notes digest:
${digest.slice(0, 6000)}

Current templates (core = 4 first items in buy order; sit = situational item per condition):
${JSON.stringify(current)}

Allowed items: ${gear.join(' | ')}

Propose changes ONLY where the patch notes clearly justify them (a buffed or nerfed item changes its value). At most 6 changes. Reply ONLY with JSON, no backticks:
{"changes":[{"archetype":"fighter_ad","field":"core","value":["i1","i2","i3","i4"],"reason":"one sentence"},{"archetype":"tank_ad","field":"sit","key":"ap","value":"item name","reason":"one sentence"}]}
Use {"changes":[]} if nothing is justified.`

const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
  body: JSON.stringify({ model: MODEL, temperature: 0.1, max_tokens: 2500, reasoning: { effort: 'low' }, messages: [{ role: 'user', content: prompt }] }),
})
const data = await resp.json().catch(() => ({}))
const text = data.choices?.[0]?.message?.content || ''
const json = text.match(/\{[\s\S]*\}/)?.[0]
if (!json) { console.error('no JSON from model', data.error?.message || resp.status); process.exit(0) }

const ok = []
for (const c of JSON.parse(json).changes || []) {
  const b = game.builds[c.archetype]
  if (!b) continue
  if (c.field === 'core' && Array.isArray(c.value) && c.value.length === 4 && new Set(c.value).size === 4 && c.value.every(v => gear.includes(v))) {
    b.core = c.value; ok.push(c)
  } else if (c.field === 'sit' && c.key in (b.sit || {}) && gear.includes(c.value)) {
    b.sit[c.key] = c.value; ok.push(c)
  }
}
if (!ok.length) process.exit(0)

game.version = new Date().toISOString().slice(0, 16)   // minutes: must sort after the date-only versions
writeFileSync(file, JSON.stringify(game, null, 1) + '\n')
const lines = ok.map(c => `- **${c.archetype}** ${c.field}${c.key ? `.${c.key}` : ''} → ${[].concat(c.value).join(', ')}\n  ${c.reason}`)
writeFileSync(new URL('../proposal.md', import.meta.url), `Propuesta automática (modelo \`${MODEL}\`). **Revísala antes de aceptar**: el modelo no conoce el meta, solo razona sobre las notas del parche.\n\n${lines.join('\n')}\n\n---\n${digest.split('\n').slice(0, 3).join('\n')}\n`)
console.log(`${ok.length} change(s) proposed`)
