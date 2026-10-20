import { defineConfig } from 'vitest/config'

// separate from the unit tests: this one talks to the real AI providers (only when you run it with your keys)
export default defineConfig({ test: { include: ['bench/**/*.test.js'], setupFiles: ['tests/setup.js'], disableConsoleIntercept: true } })
