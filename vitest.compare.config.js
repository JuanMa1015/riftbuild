import { defineConfig } from 'vitest/config'
import { gameCatalog } from './scripts/game-catalog-plugin.js'

// separate from the unit tests: this one talks to the real AI providers (only when you run it with your keys)
export default defineConfig({ plugins: [gameCatalog], test: { include: ['bench/**/*.test.js'], setupFiles: ['tests/setup.js'], disableConsoleIntercept: true } })
