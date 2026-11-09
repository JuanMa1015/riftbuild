import { useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { LANES } from '../../data/champions'
import { CHAMPIONS } from '../../data/champions'
import { useDataStore } from '../../store'
import { useT, fold } from '../../i18n'
import { ChampImg, LaneGlyph } from '../ui'

// champion roles in the data are Solo/Jungla/Mid/ADC/Support; board lanes are top/jg/mid/adc/sup
const LANE_ROLE = { top: 'Solo', jg: 'Jungla', mid: 'Mid', adc: 'ADC', sup: 'Support' }

// Live search: the grid filters on every keystroke; Enter picks the first match.
// `ring` maps a champion name to a ring class when it is already on the board.
export default function ChampSearch({ placeholder, onPick, ring = () => '', occupiedLane = () => null, recents = [], pools = null, label, header, between = null, closedMessage, autoLane }) {
  const { t, tr, lang } = useT()
  const rev = useDataStore(s => s.rev)
  const [q, setQ] = useState('')
  const searching = Boolean(q.trim())
  const top = useRef(null)
  // Typing searches the entire roster, even when a lane filter is selected.
  const followsSlot = autoLane !== undefined
  const [filter, setFilter] = useState(followsSlot ? 'auto' : 'all')
  const lane = filter === 'auto' ? autoLane || 'all' : filter
  const filters = [...(followsSlot ? ['auto'] : []), 'all', ...LANES.map(l => l.id)]

  const list = useMemo(() => {
    const f = fold(q.trim())
    return CHAMPIONS.filter(c => (f || lane === 'all' || c.r.includes(LANE_ROLE[lane])) && (!f || fold(tr(c.n)).includes(f)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, rev, lang, lane])

  function pick(c) { onPick(c); setQ('') }
  // favourites of the selected lane (all lanes when the filter is on 'Todos'); recents are shown separately
  const poolNames = pools ? [...new Set(lane === 'all' ? Object.values(pools).flat() : pools[lane] || [])] : []
  const row = (title, names) => (
    <div className="mb-3">
      <p className="mb-1.5 text-sm font-medium text-chalk-dim">{title}</p>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {names.map(n => (
          <button key={n} type="button" onClick={() => pick(CHAMPIONS.find(c => c.n === n))}
            className="flex w-16 shrink-0 flex-col items-center gap-1 rounded-lg py-1 active:scale-95">
            <ChampImg name={n} size={52} className={`rounded-full ${ring(n)}`} />
            <span className="w-full truncate text-center text-xs">{tr(n)}</span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div ref={top}>
      <div className="sticky top-0 z-10 bg-felt pb-2 pt-1">
        {header}
        {closedMessage && <p className="text-sm text-chalk-dim">{closedMessage}</p>}
        {!closedMessage && <>
        <label className="block">
        {label && <span role="status" className="mb-1 block text-sm font-medium text-chalk-dim">{label}</span>}
        <span className="flex h-12 tiny:h-10 items-center gap-2 rounded-xl border border-line bg-felt-2 px-3 focus-within:border-marker">
          <Search size={18} className="shrink-0 text-chalk-dim" aria-hidden />
          <input
            value={q}
            onFocus={() => top.current?.scrollIntoView({ block: 'start' })}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => {
              if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
              const available = list.find(c => !occupiedLane(c.n))
              if (available) pick(available)
            }}
            placeholder={placeholder}
            aria-label={label || placeholder}
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-base outline-none"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} aria-label={t('clear')}
              className="flex h-11 w-11 items-center justify-center rounded-full text-chalk-dim hover:text-chalk">
              <X size={18} />
            </button>
          )}
        </span>
        </label>
        {!searching && <div role="group" aria-label={t('showLane')} className={`mt-1 flex flex-wrap gap-1.5 ${followsSlot ? 'tiny:flex-nowrap tiny:overflow-x-auto' : 'tiny:hidden'}`}>
          {filters.map(id => {
            const on = filter === id
            return (
              <button key={id} type="button" aria-pressed={on} onClick={() => setFilter(id)}
                className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold ${on ? 'border-marker bg-marker text-marker-ink' : 'border-line text-chalk-dim'}`}>
                {id !== 'all' && id !== 'auto' && <LaneGlyph lane={id} size={14} />}
                {id === 'auto' ? t('draftAutoLane', { lane: t('lane.' + autoLane) }) : id === 'all' ? t('all') : t('lane.' + id)}
              </button>
            )
          })}
        </div>}
        </>}
      </div>

      {!q && between}
      {!q && poolNames.length > 0 && row(t('poolTitle'), poolNames)}
      {!q && recents.length > 0 && row(t('meRecents'), recents)}

      {!closedMessage && (list.length === 0 ? (
        <p className="py-8 text-center text-chalk-dim">{t('noMatch')} “{q}”</p>
      ) : (
        <ul className={searching ? 'grid gap-1' : 'grid grid-cols-4 gap-x-1 gap-y-2 sm:grid-cols-5 md:grid-cols-4 xl:grid-cols-[repeat(auto-fill,minmax(56px,1fr))]'}>
          {list.map(c => {
            const position = occupiedLane(c.n)
            return (
              <li key={c.n}>
                <button type="button" disabled={!!position} aria-label={position ? `${tr(c.n)}, ${position}` : tr(c.n)} onClick={() => pick(c)}
                  className={`flex w-full items-center rounded-lg py-1.5 enabled:active:scale-95 enabled:hover:bg-felt-2 ${searching ? 'gap-3 px-2 text-left' : 'flex-col gap-1'}`}>
                  <ChampImg name={c.n} size={searching ? 40 : 56} className={`shrink-0 rounded-full ${ring(c.n)}`} />
                  <span className={searching ? 'min-w-0 text-sm font-semibold' : 'w-full px-0.5 text-center text-xs leading-tight'}>
                    <span className={searching ? 'block' : 'block truncate'}>{tr(c.n)}</span>
                    {position && <span className="block font-medium text-chalk-dim">{position}</span>}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ))}
    </div>
  )
}
