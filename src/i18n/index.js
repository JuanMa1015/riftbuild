import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GAME } from '../data/game'
import { useDataStore } from '../store'
import { es, en } from './ui'

export const LANGS = { es: 'Español (LATAM)', en: 'English' }

export const useLang = create(
  persist((set) => ({ lang: 'es', setLang: (lang) => set({ lang }) }), { name: 'wr-lang' })
)

// screen readers pick their voice from <html lang>
const syncLang = ({ lang }) => { if (typeof document !== 'undefined') document.documentElement.lang = lang }
syncLang(useLang.getState())
useLang.subscribe(syncLang)

// Game content (items, runes, tips…) is stored in Spanish; game.json holds the English counterpart of each string.
export const makeTr = (lang) => (s) => (lang === 'en' ? GAME.en[s] ?? s : s)

const UI = { es, en }

// t = interface text, tr = game content (items, runes, tips…). Re-renders on language change and on data hot-swap.
export function useT() {
  const lang = useLang(s => s.lang)
  useDataStore(s => s.rev)
  const t = (k, vars) => {
    let out = UI[lang][k] ?? es[k] ?? k
    if (vars) for (const [n, v] of Object.entries(vars)) out = out.replace(`{${n}}`, v)
    return out
  }
  return { lang, t, tr: makeTr(lang) }
}

// accent- and case-insensitive match for live search
export const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
