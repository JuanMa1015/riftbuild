import { useState, useMemo } from 'react'
import { LANES, CHAMPIONS, ROLE_OPTIONS, ROLE_MAP } from '../../data/champions'
import { useMatchStore, useRecentStore, useDataStore } from '../../store'
import { ChampImg } from '../ui'
import ChampionPicker from './ChampionPicker'
import { useT } from '../../i18n'

const CHIPS = [
  { k:'ap',   l:'hintAP' },
  { k:'ad',   l:'hintAD' },
  { k:'heal', l:'hintHeal' },
  { k:'cc',   l:'hintCC' },
  { k:'tank', l:'hintTank' },
]

const chip = on => `px-3 py-2 text-[12px] font-bold rounded-full border select-none transition-colors
  ${on ? 'bg-[var(--gold)] text-black border-[var(--gold)]' : 'bg-[var(--bg4)] text-[var(--text2)] border-[var(--border)]'}`

export default function QuickPlay() {
  const { t, tr, lang } = useT()
  const rev = useDataStore(s => s.rev)
  const { myChamp, myRole, enemies, hints, setMyChamp, setMyRole, setEnemy, toggleHint } = useMatchStore()
  const { mine, pushMine } = useRecentStore()
  const [q, setQ] = useState('')

  const enemyNames = LANES.map(l => enemies[l.id]).filter(Boolean)
  const list = useMemo(
    () => CHAMPIONS.filter(c => tr(c.n).toLowerCase().includes(q.trim().toLowerCase())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, lang, rev]
  )

  function pickMine(c) {
    setMyChamp(c)
    pushMine(c.n)
    const r = ROLE_MAP[c.r[0]]
    if (r) setMyRole(r)
  }

  // Tap a portrait: fills the first empty slot; tapping a selected one removes it.
  function toggleEnemy(name) {
    const taken = LANES.find(l => enemies[l.id] === name)
    if (taken) return setEnemy(taken.id, '')
    const free = LANES.find(l => !enemies[l.id])
    if (free) setEnemy(free.id, name)
  }

  return (
    <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-[10px] mb-3.5 p-3.5">
      {/* 1 — mi campeón */}
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--gold)] mb-2">{t('step1')}</div>
      <div className="flex gap-2 overflow-x-auto pb-1 mb-2">
        {mine.map(n => {
          const c = CHAMPIONS.find(x => x.n === n)
          if (!c) return null
          const on = myChamp?.n === n
          return (
            <button key={n} onClick={() => pickMine(c)}
              className={`flex-shrink-0 p-1 rounded-[8px] border ${on ? 'border-[var(--gold)] bg-[rgba(200,155,60,0.12)]' : 'border-transparent bg-[var(--bg3)]'}`}>
              <ChampImg name={n} size={48} className="rounded-[7px]" />
            </button>
          )
        })}
        <div className="flex-1 min-w-[150px]">
          <ChampionPicker value={myChamp} onChange={c => c && pickMine(c)} placeholder={t('otherChamp')} />
        </div>
      </div>
      <div className="flex gap-1.5 overflow-x-auto mb-4">
        {ROLE_OPTIONS.map(o => (
          <button key={o.value} onClick={() => setMyRole(o.value)} className={chip(myRole === o.value) + ' flex-shrink-0'}>
            {t('lane.' + o.value.split(' ')[0])}
          </button>
        ))}
      </div>

      {/* 2 — enemigos */}
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--red3)] mb-2">{t('step2')} ({enemyNames.length}/5)</div>
      <div className="flex gap-2 mb-2">
        {LANES.map(l => (
          <button key={l.id} onClick={() => enemies[l.id] && setEnemy(l.id, '')}
            className="w-14 h-14 rounded-[8px] border border-dashed border-[var(--border2)] bg-[var(--bg3)] flex items-center justify-center">
            {enemies[l.id] ? <ChampImg name={enemies[l.id]} size={52} className="rounded-[7px]" /> : <span className="opacity-40">{l.ico}</span>}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 flex-wrap mb-2">
        {CHIPS.map(c => (
          <button key={c.k} onClick={() => toggleHint(c.k)} className={chip(hints[c.k])}>{t(c.l)}</button>
        ))}
      </div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('searchEnemy')}
        className="w-full mb-2 px-3 py-2 text-[13px] bg-[var(--bg3)] border border-[var(--border2)] rounded-[6px] text-[var(--text)] outline-none" />
      <div className="grid gap-1.5 max-h-[220px] overflow-y-auto" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(56px,1fr))' }}>
        {list.map(c => (
          <button key={c.n} onClick={() => toggleEnemy(c.n)}
            className={`p-1 rounded-[7px] border ${enemyNames.includes(c.n) ? 'border-[var(--red3)] bg-[rgba(181,48,31,0.15)]' : 'border-transparent bg-[var(--bg3)]'}`}>
            <ChampImg name={c.n} size={44} className="rounded-[6px] mx-auto" />
            <div className="text-[9px] text-center text-[var(--text2)] truncate">{tr(c.n)}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
