import { useEffect, useRef, useState } from 'react'

const PAUSE_MS = 4000
const AUTO_LIMIT = 3

export function useSharedCoach({ body, draftId, auto, rivalCount, matchup }) {
  const [manual, setManual] = useState(null)
  const [result, setResult] = useState(null)
  const handled = useRef(null)
  const session = useRef(null)

  useEffect(() => {
    if (session.current?.id !== draftId) {
      session.current = { id: draftId, count: 0, matchup: null, complete: false, cache: new Map() }
    }
    if (!body) return
    const budget = session.current
    const requested = manual && manual !== handled.current && manual.body === body && manual.draftId === draftId
    const show = result => setResult({ ...result, body, draftId })
    const cached = budget.cache.get(body)
    if (cached && !requested) {
      show(cached)
      return
    }
    const reserveFullDraft = rivalCount < 5 && !budget.complete
    const skipPartial = reserveFullDraft && (budget.matchup === matchup || budget.count >= AUTO_LIMIT - 1)
    if (!requested && (!auto || !rivalCount || budget.count >= AUTO_LIMIT || skipPartial)) {
      setResult(previous => previous?.state === 'thinking' ? null : previous)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      if (requested) handled.current = manual
      else {
        budget.count += 1
        budget.matchup = matchup
        if (rivalCount === 5) budget.complete = true
      }
      show({ state: 'thinking' })
      try {
        const response = await fetch(import.meta.env.VITE_COACH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(18000)]),
        })
        if (!response.ok) throw new Error()
        const { coach, via } = await response.json()
        if (controller.signal.aborted) return
        const ready = { state: 'ready', data: coach, via }
        budget.cache.set(body, ready)
        show(ready)
      } catch {
        if (!controller.signal.aborted) show({ state: 'unavailable' })
      }
    }, requested ? 0 : PAUSE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [auto, body, draftId, manual, rivalCount, matchup])

  return {
    coach: body && result?.body === body && result.draftId === draftId ? result : { state: 'idle' },
    refresh: () => setManual({ body, draftId }),
  }
}
