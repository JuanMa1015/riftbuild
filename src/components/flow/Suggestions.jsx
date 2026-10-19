import { useMatchStore, usePoolStore } from '../../store'
import { LANES } from '../../data/champions'
import { recommend } from '../../lib/recommend'
import { useT } from '../../i18n'
import { Token, ROLE_LANE, SectionTitle } from '../ui'
import { Star } from 'lucide-react'

// "Who should I pick?" from the rivals and allies already on the board. Tap a row to pick it.
export default function Suggestions({ onPick }) {
  const { t, tr } = useT()
  const { enemies, allies, myRole } = useMatchStore()
  const pool = usePoolStore(s => s.pool)
  const lane = ROLE_LANE[myRole] || 'all'
  const list = recommend({
    enemies: LANES.map(l => enemies[l.id]).filter(Boolean),
    allies: LANES.map(l => allies[l.id]).filter(Boolean),
    lane, pool: pool[lane] || [],
  })
  if (!list.length) return null
  return (
    <section className="mb-6" aria-label={t('sugTitle')}>
      <SectionTitle>{t('sugTitle')}</SectionTitle>
      <p className="mb-2 text-sm text-chalk-dim">{t('sugHint', { lane: t('lane.' + lane) })}</p>
      <ul className="flex flex-col gap-1.5">
        {list.map(({ c, why, inPool }) => (
          <li key={c.n}>
            <button type="button" onClick={() => onPick(c)}
              className="flex w-full items-center gap-3 rounded-xl border border-line bg-felt-2 p-2.5 text-left active:scale-[0.99]">
              <Token name={c.n} side="me" size={44} />
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
    </section>
  )
}
