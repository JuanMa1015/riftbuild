import { GAME, REPO_RAW, applyGame } from '../data/game'
import { useDataStore } from '../store'

// Pulls the latest game.json from the repo; the app keeps working offline with the bundled/cached copy.
export async function checkForUpdates() {
  try {
    const r = await fetch(`${REPO_RAW}data/game.json`, { cache: 'no-store' })
    if (!r.ok) return
    const g = await r.json()
    if (!(g.version > GAME.version)) return
    applyGame(g)
    try { localStorage.setItem('wr-game', JSON.stringify(g)) } catch { /* storage blocked */ }
    useDataStore.getState().bump()
  } catch { /* offline: keep current data */ }
}
