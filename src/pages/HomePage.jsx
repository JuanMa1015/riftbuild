import { useEffect } from 'react'
import { useMatchStore, useAIStore, useDataStore } from '../store'
import { LANES } from '../data/champions'
import { generateBuild, localBuild } from '../lib/aiService'
import { checkForUpdates } from '../lib/updater'
import { GAME } from '../data/game'
import { useT } from '../i18n'
import AIPanel from '../components/layout/AIPanel'
import OverlayToggle from '../components/layout/OverlayToggle'
import QuickPlay from '../components/picker/QuickPlay'
import TeamGrid from '../components/picker/TeamGrid'
import BuildResult from '../components/build/BuildResult'
import { Spinner } from '../components/ui'

export default function HomePage() {
  const { t, lang } = useT()
  const rev = useDataStore(s => s.rev)
  const {
    myChamp, myRole, allies, enemies, hints,
    result, loading, error,
    setResult, setLoading, setError,
  } = useMatchStore()

  const { provider, key, model } = useAIStore()

  const lists = () => ({
    allies:  LANES.map(l => allies[l.id]  ? {lane:l.lbl, name:allies[l.id]}  : null).filter(Boolean),
    enemies: LANES.map(l => enemies[l.id] ? {lane:l.lbl, name:enemies[l.id]} : null).filter(Boolean),
  })

  useEffect(() => { checkForUpdates() }, [])

  // Resultado local instantáneo en cada toque
  useEffect(() => {
    if (myChamp) setResult(localBuild({ myChamp: myChamp.n, myRole, hints, lang, ...lists() }))
  }, [myChamp, myRole, allies, enemies, hints, lang, rev]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGenerate() {
    setLoading(true)
    try {
      setResult(await generateBuild({ myChamp: myChamp.n, myRole, hints, lang, provider, key, model, ...lists() }))
    } catch(e) {
      setError(e.message)
    }
  }

  return (
    <div className="max-w-[920px] mx-auto px-3.5 py-5 pb-20">

      {/* Header */}
      <div className="flex items-center gap-3.5 px-5 py-4 mb-3.5
        bg-gradient-to-br from-[var(--bg2)] to-[rgba(200,155,60,0.07)]
        border border-[var(--border2)] rounded-[10px] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" />
        <div className="w-12 h-12 rounded-[10px] bg-gradient-to-br from-[#6a0f0f] to-[#b5301f]
          flex items-center justify-center text-[22px] flex-shrink-0 shadow-[0_4px_16px_rgba(181,48,31,0.45)]">
          ⚔️
        </div>
        <div>
          <div className="text-[19px] font-extrabold text-[var(--gold2)] tracking-tight">Wild Rift Build Advisor</div>
          <div className="text-[11px] text-[var(--text3)] mt-0.5">{t('tagline')}</div>
        </div>
        <div className="ml-auto hidden sm:flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[rgba(200,155,60,0.1)] border border-[rgba(200,155,60,0.22)] text-[var(--gold)]">
            {t('patch')} {GAME.patch}
          </span>
        </div>
      </div>

      {/* AI Panel */}
      <AIPanel />

      <QuickPlay />

      {/* Aliados: opcional, escondido para no estorbar */}
      <details className="bg-[var(--bg2)] border border-[var(--border)] rounded-[10px] mb-3.5 p-3.5">
        <summary className="text-[12px] font-bold text-[var(--text2)] cursor-pointer">{t('alliesMore')}</summary>
        <div className="mt-3"><TeamGrid /></div>
      </details>

      <OverlayToggle />

      {/* Resumen de una línea */}
      {result && (
        <div className="bg-[rgba(200,155,60,0.1)] border border-[rgba(200,155,60,0.3)] rounded-[10px] px-4 py-3 mb-3.5 text-[13px] font-bold text-[var(--gold2)]">
          {result.build?.[0]?.nombre} · {result.botas?.nombre} · {result.runas?.[0]?.n}
        </div>
      )}

      {provider !== 'local' && key?.trim() && (
        <button type="button" onClick={handleGenerate} disabled={loading || !myChamp}
          className="w-full mb-3.5 py-3 font-extrabold text-[13px] bg-[var(--bg3)] border border-[var(--border2)] rounded-[10px] text-[var(--text)] disabled:opacity-40">
          {loading ? t('consulting') : t('improveAI')}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="bg-[rgba(181,48,31,0.1)] border border-[rgba(181,48,31,0.28)] rounded-[6px] px-4 py-3 text-[var(--red3)] text-[13px] mb-3">
          <strong>{t('error')}</strong> {error}
          <span className="block text-[11px] opacity-70 mt-1">{t('errorHelp')}</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div id="result-anchor">
          <BuildResult build={result} />
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="text-center py-12 px-6 bg-[var(--bg2)] border border-[var(--border)] rounded-[10px]">
          <div className="text-[34px] mb-3">⚔️</div>
          <p className="text-[var(--text2)] text-[13px] leading-loose">
            {t('empty').split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}
          </p>
        </div>
      )}
    </div>
  )
}
