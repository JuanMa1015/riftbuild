import { useRef, useState } from 'react'
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
export default function StepFoes({ wide = false }) {
  const { t, tr } = useT()
  const { enemies, allies, hints, side, setSide, setEnemy, setAlly, toggleHint, clearTeam, myChamp, setStep } = useMatchStore()
  const slots = useRef(null)
  const [active, setActive] = useState(null)
  const [notice, setNotice] = useState('')
  const [cleared, setCleared] = useState({})
  const narrow = useMedia('(max-width: 359px)')
  const tiny = useMedia('(max-height: 420px)')   // landscape pop-up window: every pixel counts   // Samsung pop-up window and other small windows

  const team = side === 'enemy' ? enemies : allies
  const setSlot = side === 'enemy' ? setEnemy : setAlly
  const tokenSide = side === 'enemy' ? 'foe' : 'ally'
  const ringCls = side === 'enemy' ? 'ring-[3px] ring-foe' : 'ring-[3px] ring-ally'
  const target = active ?? LANES.find(l => !team[l.id])?.id
  const names = LANES.map(l => team[l.id]).filter(Boolean)
  const full = names.length === LANES.length
  const teamKey = side === 'enemy' ? 'enemies' : 'allies'
  const hasHints = side === 'enemy' && Object.values(hints).some(Boolean)
  const snapshot = cleared[side]
  const canUndo = snapshot?.emptyTeam === team && (side !== 'enemy' || snapshot.emptyHints === hints)
  const targetName = target && team[target]
  const destination = target && t(targetName ? 'replaceChampionAt' : side === 'enemy' ? 'addEnemyAt' : 'addAllyAt', {
    lane: t('lane.' + target),
    name: targetName ? tr(targetName) : '',
  })

  function clearOrUndo() {
    if (canUndo) {
      useMatchStore.setState(side === 'enemy' ? { enemies: snapshot.team, hints: snapshot.hints } : { allies: snapshot.team })
      setCleared(previous => ({ ...previous, [side]: null }))
    } else {
      clearTeam(side)
      const empty = useMatchStore.getState()
      setCleared(previous => ({
        ...previous,
        [side]: { team, hints, emptyTeam: empty[teamKey], emptyHints: empty.hints },
      }))
    }
    setActive(null)
    setNotice('')
  }

  function pick(c) {
    if (names.includes(c.n)) return
    if (!target) { setNotice(t('chooseSlot')); return }
    if (wide && (full || names.length === LANES.length - 1)) {
      slots.current?.querySelector(`[data-lane="${target}"]`)?.focus()
    }
    setSlot(target, c.n)
    setNotice('')
    setActive(null)
  }
  const board = (
    <div className="relative mb-2 rounded-2xl border border-line bg-felt-2 px-1.5 pb-2 pt-3 tiny:pb-1 tiny:pt-2">
      <svg className="pointer-events-none absolute inset-0 h-full w-full text-chalk/30" aria-hidden preserveAspectRatio="none" viewBox="0 0 100 40">
        <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        <circle cx="50" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <ul ref={slots} className="relative grid grid-cols-5 gap-0.5">
        {LANES.map(l => (
          <li key={l.id}>
            <button type="button" data-lane={l.id} onClick={() => { setActive(l.id); setNotice('') }} aria-label={`${t('lane.' + l.id)}: ${team[l.id] || '—'}`}
              aria-pressed={l.id === target} className="flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-xl py-0.5 active:scale-95">
              <Token name={team[l.id]} side={tokenSide} lane={l.id} size={tiny ? 36 : narrow ? 42 : 52} active={l.id === target} />
              <span className={`text-xs font-semibold tiny:hidden ${l.id === target ? 'text-marker' : 'text-chalk-dim'}`}>{t('lane.' + l.id)}</span>
            </button>
          </li>
        ))}
      </ul>
      {active && team[active] && (
        <button type="button" className="relative mt-1 min-h-11 w-full text-sm text-chalk" onClick={() => setSlot(active, '')}>
          {t('removeSlot', { name: tr(team[active]) })}
        </button>
      )}
      <p role="status" className={notice ? 'relative mt-1 text-center text-sm' : 'sr-only'}>{notice}</p>
    </div>
  )

  // Keep pick advice below the catalog so it never interrupts consecutive selections.
  const mineOrSuggestions = myChamp ? (
    <>
    <div className="mb-3 flex items-center gap-3 rounded-xl border border-line bg-felt-2 p-2.5">
      <Token name={myChamp.n} side="me" size={40} />
      <p className="min-w-0 flex-1 truncate font-semibold">{tr(myChamp.n)}</p>
      <button type="button" onClick={() => setStep(0)}
        className="h-11 rounded-lg border border-line px-3 text-sm font-semibold">{t('change')}</button>
    </div>
    <PickStatus />
    </>
  ) : <Suggestions compact onPick={c => chooseChampion(c, { keepRole: true })} />

  return (
    <section aria-label={t('stepFoes')}>
      <div className="mb-3 flex items-center gap-2">
        <div role="group" aria-label={t('stepFoes')} className="grid flex-1 grid-cols-2 gap-1 rounded-xl border border-line bg-felt-2 p-1">
          {[['enemy', 'foesTitle'], ['ally', 'alliesTitle']].map(([k, l]) => (
            <button key={k} type="button" aria-pressed={side === k} onClick={() => { setSide(k); setActive(null); setNotice('') }}
              className={`h-11 rounded-lg text-sm font-semibold ${side === k ? 'bg-felt-3 text-chalk' : 'text-chalk-dim'}`}>
              {t(l)} <span className="text-xs tabular-nums">{LANES.filter(lane => (k === 'enemy' ? enemies : allies)[lane.id]).length}/{LANES.length}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={clearOrUndo} disabled={!canUndo && !names.length && !hasHints}
          className="min-h-11 max-w-32 rounded-xl px-2 text-sm font-medium text-chalk-dim enabled:hover:text-chalk disabled:opacity-50">
          {t(canUndo ? 'undoClearTeam' : side === 'enemy' ? 'clearEnemies' : 'clearAllies')}
        </button>
      </div>
      <p className="mb-2 text-sm text-chalk-dim tiny:hidden">{t('compositionOptional')}</p>
      {wide && myChamp && <p className="mb-2 text-sm text-chalk-dim">{t('stepMe')} · {tr(myChamp.n)}</p>}

      {side === 'enemy' && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2 pb-1" role="group" aria-label={t('quickTitle')}>
            {CHIPS.map(c => (
              <button key={c.k} type="button" aria-pressed={hints[c.k]} onClick={() => toggleHint(c.k)}
                className={`h-11 shrink-0 rounded-full border px-4 text-sm font-semibold
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
          closedMessage={wide && full && !active ? t('chooseSlot') : undefined}
          label={destination || t('chooseSlot')}
          placeholder={t('typeToSearch')}
          onPick={pick}
          ring={n => (names.includes(n) ? ringCls : '')}
          occupiedLane={name => {
            const position = LANES.find(lane => team[lane.id] === name)
            return position ? t('lane.' + position.id) : null
          }}
      />
      {!wide && <div className="mt-4">{mineOrSuggestions}</div>}
    </section>
  )
}
