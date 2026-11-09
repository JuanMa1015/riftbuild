import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const catalog = fileURLToPath(new URL('../public/data/game.json', import.meta.url))
const id = '\0virtual:riftbuild-game'

export const gameCatalog = {
  name: 'riftbuild-game-catalog',
  resolveId(source) {
    if (source === 'virtual:riftbuild-game') return id
  },
  load(source) {
    if (source !== id) return
    this.addWatchFile(catalog)
    return 'export default ' + readFileSync(catalog, 'utf8')
  },
}
