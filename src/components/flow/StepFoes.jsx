import { useState } from 'react'
import { useMatchStore } from '../../store'
import { LANES } from '../../data/champions'
import { useT } from '../../i18n'
import { Token } from '../ui'
import { useMedia } from '../../lib/useMedia'
import ChampSearch from './ChampSearch'
import Suggestions from './Suggestions'
import PickStatus from './PickStatus'
import { chooseChampion } from '../../lib/pick'

const CHIPS = [
  { k: 'ap', l: 'hintAP' }, { k: 'ad', l: 'hintAD' }, { k: 'heal', l: 'hintHeal' },
  { k: 'cc', l: 'hintCC' }, { k: 'tank', l: 'hintTank' },
]

// Step 2: the board. Five positions per side; a pick lands on the active slot, else on the first free one.
// The board and the search box stay pinned together, so slot, query and result are always on screen.
export default function StepFoes() {
  const { t, tr } = useT()
  const { enemies, allies, hints, side, setSide, setEnemy, setAlly, toggleHint, clearTeams, myChamp, setMyChamp, setResult } = useMatchStore()
  const wide = useMedia('(min-width: 768px)')
  const [active, setActive] = useState(null)
  const narrow = useMedia('(max-width: 359px)')   // Samsung pop-up window and other small windows

  const team = side === 'enemy' ? enemies : allies
  const setSlot = side === 'enemy' ? setEnemy : setAlly
  const tokenSide = side === 'enemy' ? 'foe' : 'ally'
  const ringCls = side === 'enemy' ? 'ring-[3px] ring-foe' : 'ring-[3px] ring-ally'
  const target = active ?? LANES.find(l => !team[l.id])?.id
  const names = LANES.map(l => team[l.id]).filter(Boolean)

  function pick(c) {
    const taken = LANES.find(l => team[l.id] === c.n)
    if (taken) { setSlot(taken.id, ''); setActive(null); return }   // tapping a placed champion takes it back
    if (target) setSlot(target, c.n)
    setActive(null)
  }
  function tapSlot(id) {
    if (team[id]) { setSlot(id, ''); setActive(id) } else setActive(id)
  }

  const board = (
    <div className="relative mb-2 rounded-2xl border border-line bg-felt-2 px-1.5 pb-2 pt-3">
      <svg className="pointer-events-none absolute inset-0 h-full w-full text-chalk/30" aria-hidden preserveAspectRatio="none" viewBox="0 0 100 40">
        <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        <circle cx="50" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <ul className="relative grid grid-cols-5 gap-0.5">
        {LANES.map(l => (
          <li key={l.id}>
            <button type="button" onClick={() => tapSlot(l.id)} aria-label={`${t('lane.' + l.id)}: ${team[l.id] || '—'}`}
              className="flex w-full flex-col items-center gap-1 rounded-xl py-0.5 active:scale-95">
              <Token name={team[l.id]} side={tokenSide} lane={l.id} size={narrow ? 42 : 52} active={l.id === target} removable />
              <span className={`text-xs font-semibold ${l.id === target ? 'text-marker' : 'text-chalk-dim'}`}>{t('lane.' + l.id)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )

  // Real drafts reveal the enemy one pick at a time, so the suggestions live in this step, right under the board,
  // and update with every rival you add. Once you have a champion this slot just shows it.
  const mineOrSuggestions = myChamp ? (
    <>
    <div className="mb-3 flex items-center gap-3 rounded-xl border border-line bg-felt-2 p-2.5">
      <Token name={myChamp.n} side="me" size={40} />
      <p className="min-w-0 flex-1 truncate font-semibold">{tr(myChamp.n)}</p>
      <button type="button" onClick={() => { setMyChamp(null); setResult(null) }}
        className="h-10 rounded-lg border border-line px-3 text-sm font-semibold">{t('change')}</button>
    </div>
    <PickStatus />
    </>
  ) : <Suggestions compact onPick={c => chooseChampion(c, { keepRole: true })} />

  return (
    <section aria-label={t('stepFoes')}>
      <div className="mb-3 flex items-center gap-2">
        <div role="tablist" aria-label="Team" className="grid flex-1 grid-cols-2 gap-1 rounded-xl border border-line bg-felt-2 p-1">
          {[['enemy', 'foesTitle'], ['ally', 'alliesTitle']].map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={side === k} onClick={() => { setSide(k); setActive(null) }}
              className={`h-10 rounded-lg text-sm font-semibold ${side === k ? 'bg-felt-3 text-chalk' : 'text-chalk-dim'}`}>
              {t(l)}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => { clearTeams(); setActive(null) }}
          className="h-11 rounded-xl px-3 text-sm font-medium text-chalk-dim hover:text-chalk">{t('clear')}</button>
      </div>

      {side === 'enemy' && (
        <div className="mb-3">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="group" aria-label={t('quickTitle')}>
            {CHIPS.map(c => (
              <button key={c.k} type="button" aria-pressed={hints[c.k]} onClick={() => toggleHint(c.k)}
                className={`h-10 shrink-0 rounded-full border px-4 text-sm font-semibold
                  ${hints[c.k] ? 'border-marker bg-marker text-marker-ink' : 'border-line bg-felt-2 text-chalk'}`}>
                {t(c.l)}
              </button>
            ))}
          </div>
        </div>
      )}

      <ChampSearch
        key={side}
        header={board}
        autoLane={target ?? null}
        between={wide ? null : mineOrSuggestions}
        label={target ? `${t(side === 'enemy' ? 'searchFor' : 'searchAlly')} ${t('lane.' + target)}` : undefined}
        placeholder={t('typeToSearch')}
        onPick={pick}
        ring={n => (names.includes(n) ? ringCls : '')}
      />
    </section>
  )
}
