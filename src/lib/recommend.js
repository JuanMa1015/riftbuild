import { CHAMPIONS } from '../data/champions'

// Rule-based "who should I pick": class matchups + damage balance. NOT win-rate statistics (none are public for Wild Rift).
// MATRIX[mine][theirs] > 0 means "my class does well against theirs".
const MATRIX = {
  assassin: { marksman: 2, mage: 2, support: 1, fighter: 0, assassin: 0, tank: -2 },
  fighter:  { tank: 1, assassin: 1, marksman: 1, fighter: 0, mage: 0, support: 0 },
  mage:     { fighter: 1, support: 1, tank: -1, assassin: -1, marksman: 0, mage: 0 },
  marksman: { tank: 1, support: 1, fighter: -1, assassin: -2, mage: 0, marksman: 0 },
  tank:     { assassin: 2, support: 1, marksman: -1, fighter: 0, mage: 0, tank: 0 },
  support:  { assassin: -1, marksman: 0, mage: 0, fighter: 0, tank: 0, support: 0 },
}
const LANE_ROLE = { top: 'Solo', jg: 'Jungla', mid: 'Mid', adc: 'ADC', sup: 'Support' }
const PER_CLASS = 2   // variety: at most this many of one class in the first pass

// enemies/allies: champion names known so far (drafts reveal them one by one, so this must work with 1 or 2);
// lane: board lane id; pool: my favourites (rank higher); recents: what I played lately (tiny bonus, breaks ties)
export function recommend({ enemies, allies, lane = 'all', pool = [], recents = [], limit = 5 }) {
  const find = n => CHAMPIONS.find(c => c.n === n)
  const foes = enemies.map(find).filter(Boolean)
  const mates = allies.map(find).filter(Boolean)
  if (!foes.length && !mates.length) return []
  const taken = new Set([...enemies, ...allies])
  const ad = mates.filter(m => m.d === 'ad').length, ap = mates.filter(m => m.d === 'ap').length

  const scored = CHAMPIONS
    .filter(c => !taken.has(c.n) && (lane === 'all' || c.r.includes(LANE_ROLE[lane])))
    .map(c => {
      let score = 0, why = null
      for (const f of foes) {
        const v = MATRIX[c.t]?.[f.t] ?? 0
        score += v
        if (v > 0 && (!why || v > why.v)) why = { v, key: `why.${c.t}.${f.t}`, vs: f.n }
      }
      // a team of only AD (or only AP) is easy to itemize against: prefer the missing damage type
      if (mates.length >= 2 && ((c.d === 'ap' && ad > ap) || (c.d === 'ad' && ap > ad))) { score += 1; why = why || { v: 1, key: 'why.balance' } }
      if (pool.includes(c.n)) score += 0.75
      if (recents.includes(c.n)) score += 0.25
      return { c, score, why, inPool: pool.includes(c.n) }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.c.n.localeCompare(b.c.n))

  // first pass keeps variety (no five fighters in a row), second pass fills what is left
  const out = [], count = {}
  for (const x of scored) if ((count[x.c.t] = (count[x.c.t] || 0) + 1) <= PER_CLASS && out.length < limit) out.push(x)
  for (const x of scored) if (out.length < limit && !out.includes(x)) out.push(x)
  return out.sort((a, b) => b.score - a.score)
}
