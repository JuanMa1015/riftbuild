import { ArrowRight, Check, Lock } from 'lucide-react'
import { useMatchStore, usePoolStore, useRecentStore, useMatchLog } from '../../store'
import { LANES } from '../../data/champions'
import { evaluatePick } from '../../lib/recommend'
import { chooseChampion } from '../../lib/pick'
import { useT } from '../../i18n'
import { Token, ROLE_LANE } from '../ui'

// Under my pick: a live verdict while the rivals come in. Silent until something is known; a quiet check when the pick
// holds up; an arrow and a button only when another champion is clearly better. "Bloqueado" mutes it (a locked pick
// cannot be changed in ranked, so advice after that is just noise).
export default function PickStatus() {
  const { t, tr } = useT()
  const { myChamp, myRole, enemies, allies, locked, setLocked } = useMatchStore()
  const pool = usePoolStore(s => s.pool)
  const recents = useRecentStore(s => s.mine)
  const history = useMatchLog(s => s.entries)
  if (!myChamp) return null

  const lane = ROLE_LANE[myRole] || 'all'
  const ev = evaluatePick({
    name: myChamp.n, lane, pool: pool[lane] || [], recents, history,
    enemies: LANES.map(l => enemies[l.id]).filter(Boolean),
    allies: LANES.map(l => allies[l.id]).filter(Boolean),
  })
  if (!ev.known) return null

  const lockBtn = (
    <button type="button" onClick={() => setLocked(!locked)} aria-pressed={locked} title={t('lockHelp')}
      className={`flex h-10 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold ${locked ? 'border-marker bg-marker text-marker-ink' : 'border-line'}`}>
      <Lock size={14} aria-hidden /> {t(locked ? 'locked' : 'lockPick')}
    </button>
  )
  if (locked) return <div className="mb-3 flex justify-end">{lockBtn}</div>

  // the verdict text: why my pick suffers (if it does) and why the alternative is better
  const say = x => (x && t(x.key) !== x.key ? t(x.key, { vs: tr(x.vs || ''), w: x.w, n: x.n }) : null)

  if (!ev.switchNow) return (
    <div className="mb-3 flex items-center gap-2">
      <p className="flex min-w-0 flex-1 items-center gap-2 text-sm text-chalk-dim"><Check size={16} className="shrink-0" aria-hidden /> {t('verdictGood')}</p>
      {lockBtn}
    </div>
  )
  const { best, me } = ev
  return (
    <div className="mb-3 rounded-xl border border-marker p-3" role="status">
      <p className="mb-1 flex items-center gap-2 font-semibold">
        <Token name={myChamp.n} side="me" size={28} /> <ArrowRight size={16} aria-hidden /> <Token name={best.c.n} side="me" size={28} />
        <span className="min-w-0 truncate">{t('verdictSwitch', { name: tr(best.c.n) })}</span>
      </p>
      {say(me.bad) && <p className="text-sm leading-snug text-chalk-dim">{say(me.bad)}</p>}
      {say(best.why) && <p className="text-sm leading-snug text-chalk-dim">{say(best.why)}</p>}
      <div className="mt-2 flex items-center gap-2">
        <button type="button" onClick={() => chooseChampion(best.c, { keepRole: true })}
          className="h-10 flex-1 rounded-lg bg-marker px-3 text-sm font-bold text-marker-ink">{t('changeTo', { name: tr(best.c.n) })}</button>
        {lockBtn}
      </div>
    </div>
  )
}
