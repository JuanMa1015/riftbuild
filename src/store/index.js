import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loadKey, saveKey, loadKeys, saveKeys, migrateLegacyKey } from '../lib/secureKey'

export const AI_PROVIDERS = {
  local:      { label:"Sin IA (local)",      icon:"📦" },
  anthropic:  { label:"Anthropic",           icon:"🟠", url:"https://api.anthropic.com/v1/messages",              models:["claude-haiku-5-5","claude-sonnet-5-5"],                                            docsUrl:"https://console.anthropic.com" },
  openrouter: { label:"OpenRouter (gratis)", icon:"🆓", url:"https://openrouter.ai/api/v1/chat/completions",       models:["nvidia/nemotron-3-super-120b-a12b:free","google/gemma-4-26b-a4b-it:free"], docsUrl:"https://openrouter.ai", note:"Crea cuenta en openrouter.ai → API Keys. Sin tarjeta para modelos :free" },
  groq:       { label:"Groq (gratis)",      icon:"⚡", url:"https://api.groq.com/openai/v1/chat/completions",    models:["openai/gpt-oss-120b","qwen/qwen3.8-27b"],                  docsUrl:"https://console.groq.com/keys", note:"Cuenta gratis en console.groq.com → API Keys, sin tarjeta" },
  openai:     { label:"OpenAI",              icon:"🤖", url:"https://api.openai.com/v1/chat/completions",          models:["gpt-4o-mini","gpt-3.5-turbo"],                                                                     docsUrl:"https://platform.openai.com/api-keys" },
}

export const useAIStore = create(
  persist(
    (set, get) => ({
      provider: 'local',
      fallback: '',     // second provider: used when the main one fails, hits its limit or runs out of credit
      modelLists: {},   // models each provider really offers this key (filled by "Test key"), best first
      keys:     {},     // API keys by provider. They live in secure storage and are never part of the persisted state
      key:      '',     // the main provider's key (a mirror of keys[provider])
      model:    '',
      auto:     true,   // analyze the match live with the AI when a key is set
      setAuto:  (v) => set({ auto: v }),
      setModels: (p, ids) => set(s => ({ modelLists: { ...s.modelLists, [p]: ids }, ...(p === s.provider && !ids.includes(s.model) ? { model: ids[0] } : {}) })),
      setProvider: (p) => set(s => ({ provider: p, model: s.modelLists[p]?.[0] || AI_PROVIDERS[p]?.models?.[0] || '', key: s.keys[p] || '', fallback: s.fallback === p ? '' : s.fallback })),
      setFallback: (p) => set(s => ({ fallback: p === s.provider ? '' : p })),
      keyError: false,   // secure storage failed: the keys live only until the app closes
      setKeyFor: (p, k) => {
        const keys = { ...get().keys, [p]: k }
        if (!k) delete keys[p]
        set({ keys, key: keys[get().provider] || '', keyError: false })
        clearTimeout(saveTimer)   // typing: write once the user pauses, not per keystroke
        saveTimer = setTimeout(() => saveKeys(keys).catch(() => set({ keyError: true })), 400)
      },
      setKey: (k) => get().setKeyFor(get().provider, k),
      setModel:    (m) => set({ model: m }),
    }),
    // keys are deliberately NOT persisted here: they go to secure storage instead
    { name: 'wr-ai-config', partialize: ({ key, keys, keyError, ...rest }) => rest }
  )
)

let saveTimer
// at startup: bring the keys back from secure storage, moving over anything older versions kept
;(async () => {
  try {
    await migrateLegacyKey()   // localStorage (0.8.4 and earlier) -> the single secure key
    let keys = {}
    try { keys = JSON.parse(await loadKeys()) || {} } catch { keys = {} }
    if (!Object.keys(keys).length) {
      const single = await loadKey()   // one key for the main provider (0.8.5 to 0.9.1)
      const p = useAIStore.getState().provider
      if (single && p !== 'local') { keys = { [p]: single }; await saveKeys(keys); await saveKey('') }
    }
    useAIStore.setState({ keys, key: keys[useAIStore.getState().provider] || '' })
  } catch { useAIStore.setState({ keyError: true }) }
})()

// Your own results: the only real match data this app can have
export const useMatchLog = create(
  persist(
    (set) => ({
      entries: [],
      add: (e) => set(s => ({ entries: [{ id: crypto.randomUUID(), ...e }, ...s.entries].slice(0, 300) })),
      remove: (id) => set(s => ({ entries: s.entries.filter(x => x.id !== id) })),
      update: (id, patch) => set(s => ({ entries: s.entries.map(x => x.id === id ? { ...x, ...patch } : x) })),
    }),
    { name: 'wr-matchlog' }
  )
)

// Favourite champions per lane (they rank higher in suggestions and show up first when searching)
export const usePoolStore = create(
  persist(
    (set) => ({
      pool: { top: [], jg: [], mid: [], adc: [], sup: [] },
      toggle: (lane, name) => set(s => {
        const cur = s.pool[lane] || []
        return { pool: { ...s.pool, [lane]: cur.includes(name) ? cur.filter(n => n !== name) : [...cur, name] } }
      }),
    }),
    { name: 'wr-pool' }
  )
)

// Objective respawn timers the user corrected (seconds by id); the defaults live in game.json
export const useTimerStore = create(
  persist(
    (set) => ({ secs: {}, setSecs: (id, v) => set(s => ({ secs: { ...s.secs, [id]: v } })) }),
    { name: 'wr-timers' }
  )
)

// Bumped when game data is hot-swapped so components re-render
export const useDataStore = create((set) => ({
  rev: 0,
  bump: () => set(s => ({ rev: s.rev + 1 })),
}))

const EMPTY ={ top:"", jg:"", mid:"", adc:"", sup:"" }
const NO_HINTS = { ap:false, ad:false, heal:false, cc:false, tank:false }

// Last champions the user played (most recent first) — shown as one-tap shortcuts
export const useRecentStore = create(
  persist(
    (set) => ({
      mine: [],
      pushMine: (n) => set(s => ({ mine: [n, ...s.mine.filter(x => x !== n)].slice(0, 8) })),
    }),
    { name: 'wr-recent' }
  )
)

export const useMatchStore = create((set) => ({
  myChamp:  null,
  myRole:   'Solo / Baron',
  allies:   { ...EMPTY },
  enemies:  { ...EMPTY },
  hints:    { ...NO_HINTS },
  locked:   false,      // pick locked in the game: stop suggesting changes
  step:     0,          // 0 you · 1 rivals · 2 build (phone flow)
  view:     'flow',     // 'flow' | 'settings'
  side:     'enemy',    // which team the board is editing
  result:   null,
  loading:  false,
  error:    null,
  coach:    { state: 'idle', data: null, error: '' },   // live AI notes: idle | thinking | ready | paused | error

  setMyChamp:  (c)        => set({ myChamp: c, locked: false }),
  setLocked:   (v)        => set({ locked: v }),
  setMyRole:   (r)        => set({ myRole: r }),
  setAlly:     (id, name) => set(s => ({ allies:  { ...s.allies,  [id]: name } })),
  setEnemy:    (id, name) => set(s => ({ enemies: { ...s.enemies, [id]: name } })),
  setStep:     (n)        => set({ step: n }),
  setView:     (v)        => set({ view: v }),
  setSide:     (v)        => set({ side: v }),
  toggleHint:  (k)        => set(s => ({ hints: { ...s.hints, [k]: !s.hints[k] } })),
  // everything a finished match leaves behind, back to the first step (lane and your pool/recents stay)
  newMatch:    ()         => set({ myChamp: null, allies: { ...EMPTY }, enemies: { ...EMPTY }, hints: { ...NO_HINTS }, locked: false, step: 0, side: 'enemy', result: null, loading: false, error: null, coach: { state: 'idle', data: null, error: '' } }),
  clearTeams:  ()         => set({ allies: { ...EMPTY }, enemies: { ...EMPTY }, hints: { ...NO_HINTS }, locked: false }),
  setResult:   (r)        => set({ result: r, loading: false, error: null }),
  setLoading:  (v)        => set({ loading: v, error: null }),
  setError:    (e)        => set({ error: e,   loading: false }),
  // idle/paused/error drop the old notes (they would describe another match state); thinking keeps them dimmed
  setCoach:    (c)        => set(s => ({ coach: { ...s.coach, ...(c.state === 'thinking' || c.state === 'ready' ? {} : { data: null }), error: '', ...c } })),
}))
