import { useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { CHAMPIONS } from '../../data/champions'
import { useDataStore } from '../../store'
import { useT, fold } from '../../i18n'
import { ChampImg } from '../ui'

// Live search: the grid filters on every keystroke; Enter picks the first match.
// `ring` maps a champion name to a ring class when it is already on the board.
export default function ChampSearch({ placeholder, onPick, ring = () => '', recents = [], label, header }) {
  const { t, tr, lang } = useT()
  const rev = useDataStore(s => s.rev)
  const [q, setQ] = useState('')
  const top = useRef(null)

  const list = useMemo(() => {
    const f = fold(q.trim())
    return CHAMPIONS.filter(c => !f || fold(tr(c.n)).includes(f))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, rev, lang])

  function pick(c) { onPick(c); setQ('') }

  return (
    <div ref={top}>
      <div className="sticky top-0 z-10 bg-felt pb-2 pt-1">
        {header}
        <label className="block">
        {label && <span className="mb-1 block text-sm font-medium text-chalk-dim">{label}</span>}
        <span className="flex h-12 items-center gap-2 rounded-xl border border-line bg-felt-2 px-3 focus-within:border-marker">
          <Search size={18} className="shrink-0 text-chalk-dim" aria-hidden />
          <input
            value={q}
            onFocus={() => top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && list[0]) pick(list[0]) }}
            placeholder={placeholder}
            enterKeyHint="done"
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
      </div>

      {!q && recents.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-sm font-medium text-chalk-dim">{t('meRecents')}</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recents.map(n => (
              <button key={n} type="button" onClick={() => pick(CHAMPIONS.find(c => c.n === n))}
                className="flex w-16 shrink-0 flex-col items-center gap-1 rounded-lg py-1 active:scale-95">
                <ChampImg name={n} size={52} className={`rounded-full ${ring(n)}`} />
                <span className="w-full truncate text-center text-xs">{tr(n)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <p className="py-8 text-center text-chalk-dim">{t('noMatch')} “{q}”</p>
      ) : (
        <ul className="grid grid-cols-4 gap-x-1 gap-y-2 sm:grid-cols-5 md:grid-cols-4 xl:grid-cols-5">
          {list.map(c => (
            <li key={c.n}>
              <button type="button" onClick={() => pick(c)}
                className="flex w-full flex-col items-center gap-1 rounded-lg py-1.5 active:scale-95 hover:bg-felt-2">
                <ChampImg name={c.n} size={56} className={`rounded-full ${ring(c.n)}`} />
                <span className="w-full truncate px-0.5 text-center text-xs leading-tight">{tr(c.n)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
