import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 'system' follows the phone; 'light' / 'dark' are the user's explicit choice.
export const useTheme = create(
  persist((set) => ({ mode: 'system', setMode: (mode) => set({ mode }) }), { name: 'wr-theme' })
)

const media = window.matchMedia('(prefers-color-scheme: light)')

// Writes the resolved theme on <html>: the CSS only knows light (overrides) and dark (default).
function apply() {
  const { mode } = useTheme.getState()
  const light = mode === 'light' || (mode === 'system' && media.matches)
  document.documentElement.dataset.theme = light ? 'light' : 'dark'
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', light ? '#f3f6ef' : '#0f2a1f')
}

// Call once before the first render so there is no flash of the wrong theme.
export function initTheme() {
  apply()
  useTheme.subscribe(apply)
  media.addEventListener('change', apply)
}
