// Fails when public/data/game.json would be rejected by the app (same validator the app runs). Run: npm run check:game
import { existsSync, readFileSync } from 'node:fs'
import { isValidGame } from '../src/data/validate.js'

const g = JSON.parse(readFileSync(new URL('../public/data/game.json', import.meta.url), 'utf8'))
if (!isValidGame(g)) { console.error('game.json no pasa la validación de la app'); process.exit(1) }
const missing = Object.entries(g.items)
  .filter(([, item]) => !existsSync(new URL(`../public/items/${item.en}.png`, import.meta.url)))
  .map(([name]) => name)
if (missing.length) {
  console.error(`Ítems sin icono local (${missing.length}): ${missing.join(', ')}`)
  process.exit(1)
}
console.log(`game.json ok (${g.champions.length} campeones, ${Object.keys(g.overrides || {}).length} con build propia)`)
