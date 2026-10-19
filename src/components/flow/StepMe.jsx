import { useState } from 'react'
import { useMatchStore, useRecentStore, usePoolStore } from '../../store'
import { CHAMPIONS, ROLE_OPTIONS } from '../../data/champions'
import { chooseChampion } from '../../lib/pick'
import { useT } from '../../i18n'
import { X, Star } from 'lucide-react'
import { Token, LaneGlyph, ROLE_LANE, SectionTitle } from '../ui'
import ChampSearch from './ChampSearch'
import Suggestions from './Suggestions'
import PickStatus from './PickStatus'

// Step 1: who am I playing, and in which lane. Picking a champion sets the lane it usually plays.
export default function StepMe({ onPicked, compact = false }) {
  const { t, tr } = useT()
  const [changing, setChanging] = useState(false)
  const { myChamp, myRole, setMyChamp, setMyRole, setResult } = useMatchStore()
  const { mine } = useRecentStore()
  const pool = usePoolStore(s => s.pool)
  const togglePool = usePoolStore(s => s.toggle)
  const lane = ROLE_LANE[myRole]
  const inPool = !!myChamp && (pool[lane] || []).includes(myChamp.n)

  function pick(c, opts) {
    const first = !myChamp
    chooseChampion(c, opts)
    setChanging(false)
    if (first) onPicked?.()   // going back to change the pick must not bounce you forward again
  }

  function clearPick() { setMyChamp(null); setResult(null); setChanging(true) }

  return (
    <section aria-labelledby="me-title">
      <div className="tiny:hidden"><SectionTitle>{<span id="me-title">{t('meTitle')}</span>}</SectionTitle></div>

      {myChamp && (
        <div className="mb-4 tiny:mb-2 flex items-center gap-3 rounded-2xl border border-line bg-felt-2 p-3 tiny:p-2">
          <Token name={myChamp.n} side="me" lane={ROLE_LANE[myRole]} size={56} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold leading-tight">{tr(myChamp.n)}</p>
            <p className="text-sm text-chalk-dim">{t('role.' + myRole)}</p>
          </div>
          {compact && !changing && (
            <button type="button" onClick={() => setChanging(true)} className="h-11 rounded-xl border border-line px-4 text-sm font-semibold">{t('change')}</button>
          )}
          <button type="button" onClick={() => togglePool(lane, myChamp.n)} aria-pressed={inPool} aria-label={inPool ? t('poolRemove') : t('poolAdd')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-chalk-dim"><Star size={18} className={inPool ? 'fill-current text-marker' : ''} /></button>
          <button type="button" onClick={clearPick} aria-label={t('clearSlot')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-chalk-dim hover:text-chalk"><X size={18} /></button>
        </div>
      )}

      {myChamp && <PickStatus />}

      {myChamp && (
        <div role="radiogroup" aria-label={t('meLane')} className="mb-4 grid grid-cols-5 gap-1.5">
          {ROLE_OPTIONS.map(o => {
            const on = myRole === o.value
            return (
              <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => setMyRole(o.value)}
                className={`flex h-14 tiny:h-11 flex-col items-center justify-center gap-0.5 rounded-xl border text-xs font-semibold
                  ${on ? 'border-marker bg-marker text-marker-ink' : 'border-line bg-felt-2 text-chalk-dim'}`}>
                <LaneGlyph lane={ROLE_LANE[o.value]} size={18} />
                {t('role.' + o.value)}
              </button>
            )
          })}
        </div>
      )}

      {(!compact || !myChamp || changing) && <Suggestions onPick={c => pick(c, { keepRole: true })} />}

      {(!compact || !myChamp || changing) && <ChampSearch
        placeholder={t('meSearch')}
        onPick={pick}
        recents={mine.filter(n => CHAMPIONS.some(c => c.n === n))}
        pools={pool}
        ring={n => (n === myChamp?.n ? 'ring-[3px] ring-marker' : '')}
      />}
    </section>
  )
}
