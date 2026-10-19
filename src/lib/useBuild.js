import { useEffect, useRef, useState } from 'react'
import { useMatchStore, useAIStore, useDataStore } from '../store'
import { LANES } from '../data/champions'
import { generateBuild, localBuild } from './aiService'
import { useLang } from '../i18n'

const WAIT_MS = 4000          // how long the user waits for the AI before the local build is shown
const PAUSE_MS = 5 * 60_000   // after a key/credit/rate-limit failure, stop calling the AI for a while
let pausedUntil = 0

// The local build is always computed instantly. When an AI key is set, the AI refines it automatically:
// the user waits at most WAIT_MS; a late answer is offered, never swapped in under their eyes.
export function useBuild({ wide = false } = {}) {
  const m = useMatchStore()
  const { provider, key, model, auto } = useAIStore()
  const lang = useLang(s => s.lang)
  const rev = useDataStore(s => s.rev)
  const { myChamp, myRole, allies, enemies, hints, step, setResult, setLoading, setError } = m
  const [ai, setAi] = useState('idle')     // idle | waiting | slow | done | late | error
  const [aiError, setAiError] = useState('')
  const late = useRef(null)
  const req = useRef(0)

  const lists = () => ({
    allies:  LANES.map(l => allies[l.id]  ? { lane: l.lbl, name: allies[l.id] }  : null).filter(Boolean),
    enemies: LANES.map(l => enemies[l.id] ? { lane: l.lbl, name: enemies[l.id] } : null).filter(Boolean),
  })
  const canImprove = provider !== 'local' && !!key?.trim() && !!myChamp
  const inputs = () => ({ myChamp: myChamp.n, myRole, hints, lang, provider, key, model, ...lists() })

  // 1) local build on every change
  useEffect(() => {
    if (myChamp) setResult(localBuild({ myChamp: myChamp.n, myRole, hints, lang, ...lists() }))
    setAi('idle'); late.current = null; req.current++   // inputs changed: any answer in flight is stale
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myChamp, myRole, allies, enemies, hints, lang, rev])

  // 2) AI refinement: on the build page (phone) or once the board is mostly filled (window mode)
  const nEnemies = LANES.filter(l => enemies[l.id]).length
  const eligible = auto && canImprove && (wide ? nEnemies >= 3 : step === 2)
  useEffect(() => {
    if (!eligible || Date.now() < pausedUntil) return
    const id = ++req.current
    if (!wide) setAi('waiting')   // eslint-disable-line react-hooks/set-state-in-effect -- show the skeleton from the first frame, no flash of the local build
    const timer = setTimeout(() => {
      setAi('waiting')
      let timedOut = false
      const t = setTimeout(() => { timedOut = true; if (req.current === id) setAi('slow') }, WAIT_MS)
      generateBuild(inputs()).then(res => {
        clearTimeout(t)
        if (req.current !== id) return
        if (timedOut) { late.current = res; setAi('late') } else { setResult(res); setAi('done') }
      }).catch(e => {
        clearTimeout(t)
        if (req.current !== id) return
        if ([401, 402, 403, 429].includes(e.status)) pausedUntil = Date.now() + PAUSE_MS
        setAiError(e.message); setAi('error')
      })
    }, wide ? 2500 : 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible, myChamp, myRole, allies, enemies, hints, lang, rev, provider, model])

  async function improve() {   // manual button
    setLoading(true)
    try {
      setResult(await generateBuild(inputs())); setAi('done')
    } catch (e) {
      setError(e.message)
    }
  }
  function applyLate() { if (late.current) { setResult(late.current); late.current = null; setAi('done') } }

  return {
    result: m.result, loading: m.loading, error: m.error, canImprove,
    onImprove: improve, onApplyLate: applyLate, aiStatus: ai, aiError,
    aiOn: provider !== 'local' && !!key?.trim(), aiModel: model,
    waiting: ai === 'waiting' && !wide,   // phone: hide the local build behind a skeleton while the AI answers
  }
}
