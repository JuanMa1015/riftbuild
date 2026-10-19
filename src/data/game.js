import bundled from '../../public/data/game.json'

// Single source of truth: public/data/game.json (champions, items, builds, translations).
// The exports below are mutated in place when a newer copy arrives, so every importer sees the update.
export const REPO_RAW = import.meta.env.VITE_DATA_BASE ?? 'https://raw.githubusercontent.com/JuanMa1015/riftbuild/main/public/'
export const GAME = { version: '', patch: '', en: {}, timers: [] }
export const CHAMPIONS = []
export const ITEMS = {}
export const BUILDS = {}

export function applyGame(g) {
  GAME.version = g.version
  GAME.patch = g.patch
  GAME.en = g.en || {}
  GAME.timers = g.timers || []
  CHAMPIONS.splice(0, CHAMPIONS.length, ...g.champions)
  for (const [target, src] of [[ITEMS, g.items], [BUILDS, g.builds]]) {
    for (const k of Object.keys(target)) delete target[k]
    Object.assign(target, src)
  }
}

applyGame(bundled)
try {
  const cached = JSON.parse(localStorage.getItem('wr-game'))
  if (cached?.version > bundled.version) applyGame(cached) // a newer app build always wins over an old cache
} catch { /* no cache, or storage blocked */ }
