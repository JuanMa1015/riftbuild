import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GAME } from '../data/game'
import { useDataStore } from '../store'

export const LANGS = { es: 'Español (LATAM)', en: 'English' }

export const useLang = create(
  persist((set) => ({ lang: 'es', setLang: (lang) => set({ lang }) }), { name: 'wr-lang' })
)

// Game content (items, runes, tips…) is stored in Spanish; game.json holds the English counterpart of each string.
export const makeTr = (lang) => (s) => (lang === 'en' ? GAME.en[s] ?? s : s)

const es = {
  tagline: 'Builds adaptadas · Cualquier campeón · Todos los carriles',
  patch: 'Patch',
  aiSettings: '⚙️ Configuración de IA',
  aiLocal: 'Sin IA · modo local',
  aiActive: 'activo',
  aiBadgeFree: 'gratis', aiBadgeOffline: 'offline', aiBadgeKey: 'API key',
  aiLocalNote: 'Modo local: base de datos integrada de builds. Funciona 100% offline, sin internet ni API key.',
  aiKeyPlaceholder: 'Pega tu API key de',
  aiModel: 'Modelo',
  aiKeyAt: 'API key en',
  language: 'Idioma',
  step1: '1 · Tu campeón',
  step2: '2 · Enemigos',
  otherChamp: 'Otro campeón...',
  searchEnemy: '🔍 Buscar enemigo...',
  'lane.Solo': 'Solo', 'lane.Jungla': 'Jungla', 'lane.Mid': 'Mid', 'lane.ADC': 'ADC', 'lane.Support': 'Support',
  'lane.top': 'Top', 'lane.jg': 'Jungla', 'lane.mid': 'Mid', 'lane.adc': 'ADC', 'lane.sup': 'Supp',
  'role.Solo / Baron': 'Solo / Baron (Top)', 'role.Jungla': 'Jungla', 'role.Mid': 'Mid', 'role.ADC / Duo': 'ADC / Duo', 'role.Support': 'Support',
  hintAP: 'AP', hintAD: 'AD', hintHeal: 'Curación', hintCC: 'CC', hintTank: 'Tanques',
  alliesMore: '🔵 Aliados y más detalle (opcional)',
  improveAI: '✨ Mejorar con IA', consulting: 'Consultando IA...',
  error: 'Error:', errorHelp: 'Verifica tu API key o cambia a modo local.',
  empty: 'Elige tu campeón, toca a los enemigos\ny la build aparece al instante.',
  bubbleOn: '🟡 Burbuja activa (toca para quitar)', bubbleOff: '🫧 Activar burbuja sobre el juego',
  buyOrder: '⚔️ Orden de compra', hoverHint: 'Pasa el cursor sobre cada ítem para ver el resumen.',
  whyItems: '📖 Por qué cada ítem', boots: '👟 Botas + Encantamiento', enchant: '+ Encantamiento:',
  runes: '💎 Runas', skillOrder: '🎮 Orden de habilidades', spells: '⚡ Hechizos de invocador',
  tip: '💡 Consejo táctico', tipFor: 'Para esta partida: ', bootsLbl: 'Botas', runeLbl: 'Runa', spellsLbl: 'Hechizos',
  composition: '🗺️ Composición', compositionHint: '(opcional, mejora mucho la build)', clear: 'Limpiar ✕',
  allies: '🔵 Aliados', enemies: '🔴 Enemigos',
  searchName: 'Buscar por nombre...', noResults: 'Sin resultados 🔍', pick: 'Elegir...',
  all: 'Todos',
}

const en = {
  tagline: 'Adapted builds · Any champion · Every lane',
  patch: 'Patch',
  aiSettings: '⚙️ AI settings',
  aiLocal: 'No AI · local mode',
  aiActive: 'active',
  aiBadgeFree: 'free', aiBadgeOffline: 'offline', aiBadgeKey: 'API key',
  aiLocalNote: 'Local mode: built-in build database. Works 100% offline, no internet or API key needed.',
  aiKeyPlaceholder: 'Paste your API key for',
  aiModel: 'Model',
  aiKeyAt: 'API key at',
  language: 'Language',
  step1: '1 · Your champion',
  step2: '2 · Enemies',
  otherChamp: 'Other champion...',
  searchEnemy: '🔍 Search enemy...',
  'lane.Solo': 'Baron', 'lane.Jungla': 'Jungle', 'lane.Mid': 'Mid', 'lane.ADC': 'ADC', 'lane.Support': 'Support',
  'lane.top': 'Baron', 'lane.jg': 'Jungle', 'lane.mid': 'Mid', 'lane.adc': 'ADC', 'lane.sup': 'Supp',
  'role.Solo / Baron': 'Solo / Baron (Top)', 'role.Jungla': 'Jungle', 'role.Mid': 'Mid', 'role.ADC / Duo': 'ADC / Duo', 'role.Support': 'Support',
  hintAP: 'AP', hintAD: 'AD', hintHeal: 'Healing', hintCC: 'CC', hintTank: 'Tanks',
  alliesMore: '🔵 Allies and more detail (optional)',
  improveAI: '✨ Improve with AI', consulting: 'Asking AI...',
  error: 'Error:', errorHelp: 'Check your API key or switch to local mode.',
  empty: 'Pick your champion, tap the enemies\nand the build shows up instantly.',
  bubbleOn: '🟡 Bubble active (tap to remove)', bubbleOff: '🫧 Enable bubble over the game',
  buyOrder: '⚔️ Build order', hoverHint: 'Hover over each item to see the summary.',
  whyItems: '📖 Why each item', boots: '👟 Boots + Enchantment', enchant: '+ Enchantment:',
  runes: '💎 Runes', skillOrder: '🎮 Skill order', spells: '⚡ Summoner spells',
  tip: '💡 Tactical tip', tipFor: 'For this match: ', bootsLbl: 'Boots', runeLbl: 'Rune', spellsLbl: 'Spells',
  composition: '🗺️ Composition', compositionHint: '(optional, improves the build a lot)', clear: 'Clear ✕',
  allies: '🔵 Allies', enemies: '🔴 Enemies',
  searchName: 'Search by name...', noResults: 'No results 🔍', pick: 'Pick...',
  all: 'All',
}

const UI = { es, en }

// t = interface text, tr = game content (items, runes, tips…). Re-renders on language change and on data hot-swap.
export function useT() {
  const lang = useLang(s => s.lang)
  useDataStore(s => s.rev)
  return { lang, t: (k) => UI[lang][k] ?? es[k] ?? k, tr: makeTr(lang) }
}
