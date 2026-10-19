import { GAME, REPO_RAW, applyGame } from '../data/game'
import { isValidGame } from '../data/validate'
import { useDataStore } from '../store'

// Pulls the latest game.json from the repo; the app keeps working offline with the bundled/cached copy.
export async function checkForUpdates() {
  try {
    const r = await fetch(`${REPO_RAW}data/game.json`)   // default cache mode: GitHub answers conditional requests, so repeat launches are cheap
    if (!r.ok) return
    const g = await r.json()
    if (!isValidGame(g) || !(g.version > GAME.version)) return
    applyGame(g)
    try { localStorage.setItem('wr-game', JSON.stringify(g)) } catch { /* storage blocked */ }
    useDataStore.getState().bump()
  } catch { /* offline: keep current data */ }
}
