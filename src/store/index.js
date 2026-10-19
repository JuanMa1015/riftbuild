import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const AI_PROVIDERS = {
  local:      { label:"Sin IA (local)",      icon:"📦" },
  anthropic:  { label:"Anthropic",           icon:"🟠", url:"https://api.anthropic.com/v1/messages",              models:["claude-haiku-5-5","claude-sonnet-5-5"],                                            docsUrl:"https://console.anthropic.com" },
  openrouter: { label:"OpenRouter (gratis)", icon:"🆓", url:"https://openrouter.ai/api/v1/chat/completions",       models:["mistralai/mistral-7b-instruct:free","meta-llama/llama-3.1-8b-instruct:free","google/gemma-2-9b-it:free"], docsUrl:"https://openrouter.ai", note:"Crea cuenta en openrouter.ai → API Keys. Sin tarjeta para modelos :free" },
  openai:     { label:"OpenAI",              icon:"🤖", url:"https://api.openai.com/v1/chat/completions",          models:["gpt-4o-mini","gpt-3.5-turbo"],                                                                     docsUrl:"https://platform.openai.com/api-keys" },
}

export const useAIStore = create(
  persist(
    (set) => ({
      provider: 'local',
      key:      '',
      model:    '',
      setProvider: (p) => set({ provider: p, model: AI_PROVIDERS[p]?.models?.[0] || '' }),
      setKey:      (k) => set({ key: k }),
      setModel:    (m) => set({ model: m }),
    }),
    { name: 'wr-ai-config' }
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
  step:     0,          // 0 you · 1 rivals · 2 build (phone flow)
  view:     'flow',     // 'flow' | 'settings'
  side:     'enemy',    // which team the board is editing
  result:   null,
  loading:  false,
  error:    null,

  setMyChamp:  (c)        => set({ myChamp: c }),
  setMyRole:   (r)        => set({ myRole: r }),
  setAlly:     (id, name) => set(s => ({ allies:  { ...s.allies,  [id]: name } })),
  setEnemy:    (id, name) => set(s => ({ enemies: { ...s.enemies, [id]: name } })),
  setStep:     (n)        => set({ step: n }),
  setView:     (v)        => set({ view: v }),
  setSide:     (v)        => set({ side: v }),
  toggleHint:  (k)        => set(s => ({ hints: { ...s.hints, [k]: !s.hints[k] } })),
  clearTeams:  ()         => set({ allies: { ...EMPTY }, enemies: { ...EMPTY }, hints: { ...NO_HINTS } }),
  setResult:   (r)        => set({ result: r, loading: false, error: null }),
  setLoading:  (v)        => set({ loading: v, error: null }),
  setError:    (e)        => set({ error: e,   loading: false }),
}))
