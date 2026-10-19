import { useState } from 'react'
import { useMatchStore, useRecentStore } from '../../store'
import { CHAMPIONS, ROLE_OPTIONS, ROLE_MAP } from '../../data/champions'
import { useT } from '../../i18n'
import { Token, LaneGlyph, ROLE_LANE, SectionTitle } from '../ui'
import ChampSearch from './ChampSearch'

// Step 1: who am I playing, and in which lane. Picking a champion sets the lane it usually plays.
export default function StepMe({ onPicked, compact = false }) {
  const { t, tr } = useT()
  const [changing, setChanging] = useState(false)
  const { myChamp, myRole, setMyChamp, setMyRole } = useMatchStore()
  const { mine, pushMine } = useRecentStore()

  function pick(c) {
    setMyChamp(c)
    pushMine(c.n)
    const r = ROLE_MAP[c.r[0]]
    if (r) setMyRole(r)
    setChanging(false)
    onPicked?.()
  }

  return (
    <section aria-labelledby="me-title">
      <SectionTitle>{<span id="me-title">{t('meTitle')}</span>}</SectionTitle>

      {myChamp && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-felt-2 p-3">
          <Token name={myChamp.n} side="me" lane={ROLE_LANE[myRole]} size={56} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold leading-tight">{tr(myChamp.n)}</p>
            <p className="text-sm text-chalk-dim">{t('meLane')}</p>
          </div>
          {compact && !changing && (
            <button type="button" onClick={() => setChanging(true)} className="h-11 rounded-xl border border-line px-4 text-sm font-semibold">{t('change')}</button>
          )}
        </div>
      )}

      {myChamp && (
        <div role="radiogroup" aria-label={t('meLane')} className="mb-4 grid grid-cols-5 gap-1.5">
          {ROLE_OPTIONS.map(o => {
            const on = myRole === o.value
            return (
              <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => setMyRole(o.value)}
                className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl border text-xs font-semibold
                  ${on ? 'border-marker bg-marker text-marker-ink' : 'border-line bg-felt-2 text-chalk-dim'}`}>
                <LaneGlyph lane={ROLE_LANE[o.value]} size={18} />
                {t('role.' + o.value)}
              </button>
            )
          })}
        </div>
      )}

      {(!compact || !myChamp || changing) && <ChampSearch
        placeholder={t('meSearch')}
        onPick={pick}
        recents={mine.filter(n => CHAMPIONS.some(c => c.n === n))}
        ring={n => (n === myChamp?.n ? 'ring-[3px] ring-marker' : '')}
      />}
    </section>
  )
}
