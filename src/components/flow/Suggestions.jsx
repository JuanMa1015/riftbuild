import { Star } from 'lucide-react'
import { useMatchStore, usePoolStore, useRecentStore } from '../../store'
import { LANES, ROLE_OPTIONS } from '../../data/champions'
import { CHAMPIONS } from '../../data/champions'
import { recommend } from '../../lib/recommend'
import { useT } from '../../i18n'
import { Token, ROLE_LANE, SectionTitle } from '../ui'

// "Who should I pick?" from the rivals and allies known so far. In a ranked draft the enemy picks show up one by one,
// so this updates as you add them; in a blind pick there is nothing to go on and it falls back to your pool.
export default function Suggestions({ onPick, compact = false }) {
  const { t, tr } = useT()
  const { enemies, allies, myRole, myChamp, setMyRole } = useMatchStore()
  const pool = usePoolStore(s => s.pool)
  const mine = useRecentStore(s => s.mine)
  const lane = ROLE_LANE[myRole] || 'all'
  const foes = LANES.map(l => enemies[l.id]).filter(Boolean)
  const mates = LANES.map(l => allies[l.id]).filter(Boolean)
  const list = recommend({ enemies: foes, allies: mates, lane, pool: pool[lane] || [], recents: mine, limit: compact ? 3 : 5 })
  const favs = (pool[lane] || []).map(n => CHAMPIONS.find(c => c.n === n)).filter(Boolean)
  const known = foes.length + mates.length > 0

  return (
    <section className="mb-4" aria-label={t('sugTitle')}>
      <SectionTitle>{t('sugTitle')}</SectionTitle>

      {/* the lane comes first: the matchmaker assigns it, and suggestions are per lane */}
      {!myChamp && (
        <label className="mb-3 flex items-center gap-3 text-sm">
          <span className="text-chalk-dim">{t('meLane')}</span>
          <select value={myRole} onChange={e => setMyRole(e.target.value)}
            className="h-10 flex-1 rounded-xl border border-line bg-felt-2 px-3 font-semibold outline-none focus:border-marker">
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{t('role.' + o.value)}</option>)}
          </select>
        </label>
      )}

      <p className="mb-2 text-sm text-chalk-dim">
        {known ? t('sugBasis', { foes: `${foes.length} ${t(foes.length === 1 ? 'foe1' : 'foeN')}`, mates: `${mates.length} ${t(mates.length === 1 ? 'ally1' : 'allyN')}` }) : t('sugEmpty')}
        {known && !compact ? ` · ${t('sugHint', { lane: t('lane.' + lane) })}` : ''}
      </p>

      {known && list.length === 0 && <p className="text-sm text-chalk-dim">{t('sugNone')}</p>}

      <ul className="flex flex-col gap-1.5">
        {list.map(({ c, why, inPool }) => (
          <li key={c.n}>
            <button type="button" onClick={() => onPick(c)}
              className="flex w-full items-center gap-3 rounded-xl border border-line bg-felt-2 p-2.5 text-left active:scale-[0.99]">
              <Token name={c.n} side="me" size={compact ? 40 : 44} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 font-semibold leading-tight">
                  {tr(c.n)} {inPool && <Star size={14} className="fill-current text-marker" aria-label={t('poolMine')} />}
                </span>
                <span className="block text-sm leading-snug text-chalk-dim">
                  {why ? (why.vs ? t(why.key, { vs: tr(why.vs) }) : t(why.key)) : ''}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* nothing known yet (blind pick): your pool for this lane is the best starting point */}
      {!known && favs.length > 0 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {favs.map(c => (
            <button key={c.n} type="button" onClick={() => onPick(c)} className="flex w-16 shrink-0 flex-col items-center gap-1 rounded-lg py-1 active:scale-95">
              <Token name={c.n} side="me" size={48} />
              <span className="w-full truncate text-center text-xs">{tr(c.n)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
