import bundled from '../../public/data/game.json'
import { isValidGame } from './validate'

// Single source of truth: public/data/game.json (champions, items, builds, translations).
// The exports below are mutated in place when a newer copy arrives, so every importer sees the update.
export const REPO_RAW = import.meta.env.VITE_DATA_BASE ?? 'https://raw.githubusercontent.com/JuanMa1015/riftbuild/main/public/'
export const GAME = { version: '', patch: '', en: {}, timers: [] }
export const CHAMPIONS = []
export const ITEMS = {}
export const BUILDS = {}
export const OVERRIDES = {}   // per-champion tweaks on top of the class template (core items, boots, keystone)

export function applyGame(g) {
  GAME.version = g.version
  GAME.patch = g.patch
  GAME.en = g.en || {}
  GAME.timers = g.timers || []
  CHAMPIONS.splice(0, CHAMPIONS.length, ...g.champions)
  for (const [target, src] of [[ITEMS, g.items], [BUILDS, g.builds], [OVERRIDES, g.overrides || {}]]) {
    for (const k of Object.keys(target)) delete target[k]
    Object.assign(target, src)
  }
}

applyGame(bundled)
try {
  const cached = JSON.parse(localStorage.getItem('wr-game'))
  if (cached?.version > bundled.version) {   // a newer app build always wins over an old cache
    if (isValidGame(cached)) applyGame(cached)
    else localStorage.removeItem('wr-game')   // corrupt cache: drop it instead of crashing on every launch
  }
} catch { /* no cache, or storage blocked */ }
