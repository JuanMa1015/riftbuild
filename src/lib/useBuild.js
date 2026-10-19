import { useEffect } from 'react'
import { useMatchStore, useAIStore, useDataStore } from '../store'
import { LANES } from '../data/champions'
import { generateBuild, localBuild } from './aiService'
import { useLang } from '../i18n'

// Recomputes the local build on every change (instant), and exposes the optional AI refinement.
export function useBuild() {
  const m = useMatchStore()
  const { provider, key, model } = useAIStore()
  const lang = useLang(s => s.lang)
  const rev = useDataStore(s => s.rev)
  const { myChamp, myRole, allies, enemies, hints, setResult, setLoading, setError } = m

  const lists = () => ({
    allies:  LANES.map(l => allies[l.id]  ? { lane: l.lbl, name: allies[l.id] }  : null).filter(Boolean),
    enemies: LANES.map(l => enemies[l.id] ? { lane: l.lbl, name: enemies[l.id] } : null).filter(Boolean),
  })

  useEffect(() => {
    if (myChamp) setResult(localBuild({ myChamp: myChamp.n, myRole, hints, lang, ...lists() }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myChamp, myRole, allies, enemies, hints, lang, rev])

  async function improve() {
    setLoading(true)
    try {
      setResult(await generateBuild({ myChamp: myChamp.n, myRole, hints, lang, provider, key, model, ...lists() }))
    } catch (e) {
      setError(e.message)
    }
  }

  return { result: m.result, loading: m.loading, error: m.error, improve, canImprove: provider !== 'local' && !!key?.trim() && !!myChamp }
}
