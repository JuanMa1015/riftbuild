import { Sparkles, Loader2 } from 'lucide-react'
import { useT } from '../i18n'
import { useMatchStore, useAIStore } from '../store'

const ROWS = [['pick', 'coachPick'], ['threat', 'coachThreat'], ['lane', 'coachLane'], ['watch', 'coachWatch']]

// Live AI notes next to the build: they refresh a moment after you stop changing the match. Old notes stay on screen,
// dimmed, while new ones are on the way, so the card never jumps around. Nothing here blocks the local build.
export default function CoachCard() {
  const { t } = useT()
  const { state, data, error } = useMatchStore(s => s.coach)
  const live = useAIStore(s => s.auto && s.provider !== 'local' && !!s.key.trim())
  if (!live || state === 'idle') return null

  const status = state === 'thinking' ? t('coachThinking')
    : state === 'ready' ? t('coachReady')
    : t(state === 'paused' ? 'coachPaused' : 'coachError', { err: (error || '').slice(0, 70) })
  const rows = data ? ROWS.filter(([k]) => data[k]) : []

  return (
    <section aria-label={t('coachTitle')} aria-busy={state === 'thinking'} className="mb-4 rounded-2xl border border-line bg-felt-2 p-3">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles size={16} className="text-marker" aria-hidden /> {t('coachTitle')}
        <span role="status" className="ml-auto flex min-w-0 items-center gap-1.5 truncate text-xs font-medium text-chalk-dim">
          {state === 'thinking' && <Loader2 size={14} className="shrink-0 animate-spin" aria-hidden />} {status}
        </span>
      </p>
      {rows.length > 0 && (
        <dl className={`mt-2 flex flex-col gap-1.5 text-sm transition-opacity ${state === 'thinking' ? 'opacity-60' : ''}`}>
          {rows.map(([k, label]) => (
            <div key={k}><dt className="inline font-semibold">{t(label)}: </dt><dd className="inline text-chalk-dim">{data[k]}</dd></div>
          ))}
        </dl>
      )}
      {rows.length === 0 && state === 'thinking' && (
        <div aria-hidden className="mt-2 flex animate-pulse flex-col gap-2">{[0, 1, 2].map(i => <div key={i} className="h-3 rounded bg-felt-3" style={{ width: `${90 - i * 15}%` }} />)}</div>
      )}
    </section>
  )
}
