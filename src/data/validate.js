// game.json comes from the network (GitHub raw) and from a cache in localStorage: check its shape before trusting it.
// A malformed copy must be ignored, never applied (it would crash the app on every launch).
const isObj = v => v && typeof v === 'object' && !Array.isArray(v)
const str = v => typeof v === 'string' && v.length > 0 && v.length < 400
const slug = v => typeof v === 'string' && /^[a-z0-9-]{1,60}$/.test(v)   // used to build image paths: no slashes or dots
const TYPES = new Set(['fighter', 'mage', 'assassin', 'marksman', 'tank', 'support'])
const DMG = new Set(['ad', 'ap', 'mixed'])

export function isValidGame(g) {
  try {
    if (!isObj(g) || !str(g.version) || !str(g.patch) || !isObj(g.en) || !isObj(g.items) || !isObj(g.builds)) return false
    if (!Array.isArray(g.champions) || g.champions.length < 50) return false
    if (!g.champions.every(c => isObj(c) && str(c.n) && Array.isArray(c.r) && TYPES.has(c.t) && DMG.has(c.d))) return false
    if (!Object.values(g.items).every(i => isObj(i) && slug(i.en) && str(i.t) && str(i.desc))) return false
    // every item a build names must exist, and a template always has four core items
    const known = new Set(Object.keys(g.items))
    for (const b of Object.values(g.builds)) {
      if (!isObj(b) || !Array.isArray(b.core) || b.core.length !== 4 || !isObj(b.sit) || !isObj(b.boots) || !Array.isArray(b.runas)) return false
      if (![...b.core, ...Object.values(b.sit), ...Object.values(b.boots)].every(n => known.has(n))) return false
    }
    // optional per-champion overrides: only known champions, known items (four core), a keystone some template already uses
    if (g.overrides !== undefined) {
      if (!isObj(g.overrides)) return false
      const champs = new Set(g.champions.map(c => c.n)), keystones = new Set(Object.values(g.builds).map(b => b.ks))
      for (const [n, o] of Object.entries(g.overrides)) {
        if (!champs.has(n) || !isObj(o)) return false
        if (o.core !== undefined && !(Array.isArray(o.core) && o.core.length === 4 && new Set(o.core).size === 4 && o.core.every(i => known.has(i)))) return false
        if (o.win !== undefined && !known.has(o.win)) return false
        if (o.boots !== undefined && !known.has(o.boots)) return false
        if (o.ks !== undefined && !keystones.has(o.ks)) return false
        if (o.fixed !== undefined && ![2, 3].includes(o.fixed)) return false
      }
    }
    // optional item tags (what it answers / who can use it) and champion traits: only the known vocabulary
    const ANS = new Set(['heal', 'shield', 'hp', 'ap', 'ad', 'cc', 'burst']), FIT = new Set(['ad', 'ap', 'tank', 'sup'])
    for (const i of Object.values(g.items)) {
      if (i.ans !== undefined && !(Array.isArray(i.ans) && i.ans.every(x => ANS.has(x)))) return false
      if (i.fit !== undefined && !(Array.isArray(i.fit) && i.fit.every(x => FIT.has(x)))) return false
    }
    if (g.traits !== undefined) {
      if (!isObj(g.traits)) return false
      const names = new Set(g.champions.map(c => c.n))
      for (const [n, tags] of Object.entries(g.traits)) if (!names.has(n) || !Array.isArray(tags) || !tags.every(x => ANS.has(x))) return false
    }
    if (g.tiers !== undefined) {
      if (!isObj(g.tiers) || !isObj(g.tiers.lanes)) return false
      const names = new Set(g.champions.map(c => c.n))
      for (const lane of Object.values(g.tiers.lanes)) for (const list of Object.values(lane)) if (!Array.isArray(list) || !list.every(n => names.has(n))) return false
    }
    if (g.timers !== undefined && !(Array.isArray(g.timers) && g.timers.every(t => isObj(t) && str(t.id) && str(t.es) && str(t.en) && Number.isFinite(t.secs) && t.secs >= 10 && t.secs <= 900))) return false
    return true
  } catch { return false }
}
