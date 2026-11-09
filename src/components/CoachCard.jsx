import { Sparkles, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useT } from '../i18n'
import { useMatchStore, useAIStore, AI_PROVIDERS } from '../store'
import { ROLE_LANE } from '../data/champions'

const ROWS = [['pick', 'coachPick'], ['threat', 'coachThreat'], ['lane', 'coachLane'], ['watch', 'coachWatch']]

// Live AI notes next to the build: they refresh a moment after you stop changing the match. Old notes stay on screen,
// dimmed, while new ones are on the way, so the card never jumps around. Nothing here blocks the local build.
export default function CoachCard({ sharedCoach }) {
  const { t, tr } = useT()
  const [phase, setPhase] = useState('lane')
  const personalCoach = useMatchStore(s => s.coach)
  const { state, data, error, via, retryAt, scope } = sharedCoach?.coach ?? personalCoach
  const locked = useMatchStore(s => s.locked)
  const main = useAIStore(s => s.provider)
  const live = useAIStore(s => s.provider === 'shared' || (s.auto && s.provider !== 'local' && !!s.key.trim()))
  if (!sharedCoach && (!live || state === 'idle')) return null

  const status = state === 'idle' ? ''
    : state === 'thinking' ? t(sharedCoach ? 'coachUpdating' : 'coachThinking')
    : state === 'ready' ? t('coachReady') + (sharedCoach && via ? ` · ${({ groq: 'Groq', gemini: 'Gemini', openrouter: 'OpenRouter' })[via] || via}` : via && via !== main ? ` · ${t('coachVia', { p: AI_PROVIDERS[via]?.label.split(' ')[0] || via })}` : '')
    : state === 'unavailable' ? t('sharedCoachUnavailable')
    : state === 'limited' ? t(scope?.endsWith('_daily') ? 'coachDailyLimit' : 'coachRateLimit')
    : t(state === 'paused' ? 'coachPaused' : 'coachError', { err: (error || '').slice(0, 70) })
  const rows = data ? ROWS.filter(([k]) => data[k] && (!locked || k !== 'pick')) : []
  const phases = [['lane', 'coachPhaseLane'], ['fights', 'coachPhaseFights'], ['objectives', 'coachPhaseObjectives']]
  const advice = data?.[phase] || t(phase === 'lane' && sharedCoach?.myRole === 'Jungla' ? 'coachLocalJungle' : 'coachLocal.' + phase)
  const renderRows = entries => (
    <dl className="mt-2 flex flex-col gap-1.5 text-sm">
      {entries.map(([k, label]) => (
        <div key={k}><dt className="inline font-semibold">{t(label)}: </dt><dd className="inline text-chalk-dim">{data[k]}</dd></div>
      ))}
    </dl>
  )

  return (
    <section aria-label={t('coachTitle')} aria-busy={state === 'thinking'} className="mb-4 rounded-2xl border border-line bg-felt-2 p-3">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles size={16} className="text-marker" aria-hidden /> {t('coachTitle')}
        <span role="status" className="ml-auto flex min-w-0 items-center gap-1.5 text-right text-xs font-medium text-chalk-dim">
          {state === 'thinking' && <Loader2 size={14} className="shrink-0 animate-spin" aria-hidden />} {status}
        </span>
      </p>
      {state === 'limited' && Number.isFinite(retryAt) && <p className="mt-1 text-sm text-chalk-dim">{t('coachRetryAt', {
        time: new Date(retryAt).toLocaleString(t('coachLocale'), { weekday: 'short', hour: 'numeric', minute: '2-digit' }),
      })}</p>}
      {sharedCoach ? (
        <div className="mt-2 grid gap-2 text-sm">
          <div>
            <p className="font-semibold">{t('coachLane')} · {t('lane.' + ROLE_LANE[sharedCoach.myRole])}{sharedCoach.directRival && ` · vs. ${tr(sharedCoach.directRival)}`}</p>
            <div className="mt-1 flex flex-wrap gap-1" role="group" aria-label={t('coachPhase')}>
              {phases.map(([id, label]) => (
                <button key={id} type="button" aria-pressed={phase === id} onClick={() => setPhase(id)} className={`min-h-11 rounded-lg px-2 ${phase === id ? 'bg-marker text-marker-ink' : 'bg-felt-3'}`}>{t(label)}</button>
              ))}
            </div>
            <p className="mt-1 text-chalk-dim">{advice}</p>
          </div>
          {data?.threat && (
            <div>
              <p className="font-semibold">{t('coachAgainstTeam')}</p>
              <p className="text-chalk-dim">{data.threat}</p>
              {data.watch && <p className="text-chalk-dim">{data.watch}</p>}
            </div>
          )}
        </div>
      ) : (
        rows.length > 0 && renderRows(rows)
      )}
      {sharedCoach && <button type="button" onClick={sharedCoach.refresh} disabled={state === 'thinking' || state === 'limited'} className="mt-2 min-h-11 rounded-lg border border-line px-3 text-sm font-semibold disabled:opacity-50">
        {t(state === 'idle' ? 'analyzeDraft' : 'coachRefresh')}
      </button>}
      {!sharedCoach && rows.length === 0 && state === 'thinking' && (
        <div aria-hidden className="mt-2 flex animate-pulse flex-col gap-2">{[0, 1, 2].map(i => <div key={i} className="h-3 rounded bg-felt-3" style={{ width: `${90 - i * 15}%` }} />)}</div>
      )}
    </section>
  )
}
