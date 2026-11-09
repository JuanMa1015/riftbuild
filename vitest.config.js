import { defineConfig } from 'vitest/config'
import { gameCatalog } from './scripts/game-catalog-plugin.js'

export default defineConfig({ plugins: [gameCatalog], test: { include: ['tests/**/*.test.js'], setupFiles: ['tests/setup.js'] } })
