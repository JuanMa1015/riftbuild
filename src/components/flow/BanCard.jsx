import { TYPE_LABEL } from '../../data/champions'
import { useT } from '../../i18n'
import { recommendBans } from '../../lib/recommend'
import { useMatchStore } from '../../store'
import { Token } from '../ui'

export default function BanCard({ name, lane }) {
  const { t, tr } = useT()
  const { allies, enemies } = useMatchStore()
  const options = recommendBans({ name, lane, allies: Object.values(allies), enemies: Object.values(enemies) })

  return (
    <section aria-label={t('banTitle')} className="mb-4 rounded-xl border border-line bg-felt-2 p-3">
      <h2 className="font-semibold">{t('banTitle')}</h2>
      {options.length === 0 && <p className="text-sm text-chalk-dim">{t('banUnavailable')}</p>}
      {options.length > 0 && (
        <ol className="mt-2 space-y-2">
          {options.map(({ c, matchup }, index) => (
            <li key={c.n} className="flex items-start gap-2">
              <Token name={c.n} side="foe" size={36} />
              <div className="min-w-0">
                <p className="font-semibold">{tr(c.n)} <span className="text-xs font-normal text-chalk-dim">· {t(index ? 'banAlternative' : 'banFirst')}</span></p>
                <p className="text-sm text-chalk-dim">{matchup ? t(matchup.reason) : t('banClassReason', { type: tr(TYPE_LABEL[c.t]) })}</p>
                {matchup && (
                  <a className="inline-flex min-h-11 items-center text-sm underline" href={matchup.source} target="_blank" rel="noopener noreferrer">
                    {t('banSource', { patch: matchup.patch })}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
