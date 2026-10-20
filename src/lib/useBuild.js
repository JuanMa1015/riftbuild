import { useEffect, useRef } from 'react'
import { track } from './analytics'
import { useMatchStore, useAIStore, useDataStore } from '../store'
import { LANES } from '../data/champions'
import { generateBuild, localBuild } from './aiService'
import { useLang } from '../i18n'

const DEBOUNCE_MS = 1500      // the AI is asked once you stop tapping, not on every tap
const PAUSE_MS = 5 * 60_000   // after a key/credit/rate-limit failure, stop calling the AI for a while
let pausedUntil = 0

// The local build is always computed instantly. With an AI key, the AI watches the match live: from the first pick it
// re-analyzes (build + coach notes) whenever you stop changing things. Stale answers are dropped, never applied.
export function useBuild() {
  const m = useMatchStore()
  const { provider, key, model, auto } = useAIStore()
  const lang = useLang(s => s.lang)
  const rev = useDataStore(s => s.rev)
  const { myChamp, myRole, allies, enemies, hints, setResult, setLoading, setError, setCoach } = m
  const req = useRef(0)
  const ctl = useRef(null)

  const lists = () => ({
    allies:  LANES.map(l => allies[l.id]  ? { lane: l.lbl, name: allies[l.id] }  : null).filter(Boolean),
    enemies: LANES.map(l => enemies[l.id] ? { lane: l.lbl, name: enemies[l.id] } : null).filter(Boolean),
  })
  const canImprove = provider !== 'local' && !!key?.trim() && !!myChamp
  const inputs = () => ({ myChamp: myChamp.n, myRole, hints, lang, provider, key, model, ...lists() })

  // 1) local build on every change
  useEffect(() => {
    if (myChamp) setResult(localBuild({ myChamp: myChamp.n, myRole, hints, lang, ...lists() }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myChamp, myRole, allies, enemies, hints, lang, rev])

  // 2) live AI analysis: debounced, the previous request is cancelled
  const live = auto && canImprove
  useEffect(() => {
    ctl.current?.abort()
    const id = ++req.current   // anything still in flight is now stale
    if (!live) { setCoach({ state: 'idle' }); return }
    if (Date.now() < pausedUntil) { setCoach({ state: 'paused' }); return }
    setCoach({ state: 'thinking' })
    const timer = setTimeout(() => {
      ctl.current = new AbortController()
      generateBuild({ ...inputs(), signal: ctl.current.signal }).then(res => {
        if (req.current !== id) return
        setResult(res)
        setCoach({ state: 'ready', data: res.coach || null, at: Date.now() })
        track('build-ai')
      }).catch(e => {
        if (e.name === 'AbortError' || req.current !== id) return
        if ([401, 402, 403, 429].includes(e.status)) pausedUntil = Date.now() + PAUSE_MS
        setCoach({ state: [401, 402, 403, 429].includes(e.status) ? 'paused' : 'error', error: e.message })
      })
    }, DEBOUNCE_MS)
    return () => { clearTimeout(timer); ctl.current?.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, myChamp, myRole, allies, enemies, hints, lang, rev, provider, model])

  async function improve() {   // manual button, for when live analysis is switched off
    setLoading(true)
    try {
      const res = await generateBuild(inputs())
      setResult(res); setCoach({ state: 'ready', data: res.coach || null, at: Date.now() })
    } catch (e) {
      setError(e.message)
    }
  }

  return {
    result: m.result, loading: m.loading, error: m.error, canImprove,
    onImprove: improve, aiOn: provider !== 'local' && !!key?.trim(), aiModel: model, live,
  }
}
