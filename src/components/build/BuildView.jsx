import { useState } from 'react'
import { ChevronDown, ChevronRight, Sparkles, Lightbulb, PictureInPicture2, Loader2 } from 'lucide-react'
import { GAME } from '../../data/game'
import { useMatchStore, useMatchLog } from '../../store'
import { LANES } from '../../data/champions'
import { useT } from '../../i18n'
import { bubbleSupported, useBubble } from '../../lib/bubble'
import { useMedia } from '../../lib/useMedia'
import { ItemImg, RuneImg, SpellImg, Token, TypeTag, ROLE_LANE, SectionTitle } from '../ui'

// legacy explanation strings start with a lightning emoji; the design system has no emoji
const clean = (x = '') => x.replace(/^⚡\s*/, '')

const TABS = [['items', 'tabItems'], ['runes', 'tabRunes'], ['plan', 'tabPlan']]

// The play: items numbered on a chalk path; tap a row to read why.
function ItemRow({ item, index, last }) {
  const { tr } = useT()
  const short = useMedia('(max-height: 520px)')   // glance mode in small windows: smaller rows, more items per screen
  const [open, setOpen] = useState(false)
  return (
    <li className="relative flex gap-3 pb-3">
      {!last && <span className="absolute left-[15px] top-9 bottom-0 w-px bg-line" aria-hidden />}
      <span className="z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chalk text-sm font-bold text-felt">{index + 1}</span>
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="min-w-0 flex-1 rounded-xl border border-line bg-felt-2 p-3 text-left short:p-1.5">
        <span className="flex items-center gap-3">
          <ItemImg en={item.en} alt="" size={short ? 32 : 44} className="rounded-lg" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold leading-tight">{item.nombre}</span>
            <span className="short:hidden"><TypeTag>{tr(item.tipo)}</TypeTag></span>
          </span>
          <ChevronDown size={18} className={`shrink-0 text-chalk-dim transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </span>
        <span className={`mt-2 block text-sm leading-snug text-chalk-dim ${open ? '' : 'line-clamp-2 short:hidden'}`}>{clean(item.por_que)}</span>
      </button>
    </li>
  )
}

function ItemsTab({ r }) {
  const { t } = useT()
  return (
    <>
      <div className="short:hidden"><SectionTitle>{t('playOrder')}</SectionTitle></div>
      <ol className="mb-2 short:[&_li]:pb-1.5">{r.build.map((b, i) => <ItemRow key={b.nombre + i} item={b} index={i} last={i === r.build.length - 1} />)}</ol>
      {r.botas && (
        <div className="rounded-xl border border-line bg-felt-2 p-3">
          <p className="mb-2 text-sm font-medium text-chalk-dim">{t('boots')}</p>
          <div className="flex items-center gap-3">
            <ItemImg en={r.botas.en} alt="" size={44} className="rounded-lg" />
            <div className="min-w-0">
              <p className="font-semibold leading-tight">{r.botas.nombre}</p>
              <p className="text-sm text-chalk-dim">{t('enchant')}: {r.botas.encantamiento}</p>
            </div>
          </div>
          <p className="mt-2 text-sm leading-snug text-chalk-dim short:hidden">{r.botas.por_que}</p>
        </div>
      )}
    </>
  )
}

function RunesTab({ r }) {
  const { t } = useT()
  return (
    <>
      <SectionTitle>{t('keystone')}</SectionTitle>
      <ul className="mb-6 flex flex-col gap-2">
        {r.runas.map((ru, i) => (
          <li key={i} className={`flex gap-3 rounded-xl border p-3 ${i === 0 ? 'border-marker bg-felt-2' : 'border-line bg-felt-2'}`}>
            <RuneImg name={ru.n || ru.nombre || ''} size={i === 0 ? 52 : 40} className="shrink-0 rounded-full" />
            <div className="min-w-0">
              <p className="text-sm text-chalk-dim">{ru.slot}</p>
              <p className="font-semibold leading-tight">{ru.n || ru.nombre}</p>
              <p className="mt-0.5 text-sm leading-snug text-chalk-dim">{clean(ru.p || ru.por_que)}</p>
            </div>
          </li>
        ))}
      </ul>
      {r.hechizos?.length > 0 && (
        <>
          <SectionTitle>{t('spells')}</SectionTitle>
          <ul className="flex gap-2">
            {r.hechizos.map(h => (
              <li key={h} className="flex flex-1 items-center gap-2.5 rounded-xl border border-line bg-felt-2 p-2.5">
                <SpellImg name={h} size={36} className="rounded-lg" />
                <span className="font-semibold">{h}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

// Floating bubble: shows this build on top of the game once you leave the app
function BubbleButton() {
  const { t } = useT()
  const on = useBubble(s => s.on)
  const toggle = useBubble(s => s.toggle)
  if (!bubbleSupported) return null
  return (
    <button type="button" onClick={toggle} aria-pressed={on}
      className={`flex h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold ${on ? 'border-marker bg-marker text-marker-ink' : 'border-line bg-felt-2 text-chalk'}`}>
      <PictureInPicture2 size={18} aria-hidden /> {on ? t('bubbleShortOn') : t('bubbleShortOff')}
    </button>
  )
}

const wl = (entries) => ({ w: entries.filter(e => e.win).length, l: entries.filter(e => !e.win).length })
const pct = ({ w, l }) => (w + l ? Math.round((100 * w) / (w + l)) : 0)

// After the match: one tap saves the result with the build you used, then an optional "what mattered" note
const NOTE_TAGS = ['tagEarly', 'tagCounter', 'tagBuild', 'tagTeam', 'tagMacro', 'tagMine']
function ResultLog({ r }) {
  const { t } = useT()
  const { myChamp, myRole, enemies, hints } = useMatchStore()
  const { add, update } = useMatchLog()
  const [saved, setSaved] = useState(null)   // id of the saved match
  const [tags, setTags] = useState([])
  const [note, setNote] = useState('')
  const [noted, setNoted] = useState(false)
  function save(win) {
    const id = Date.now()
    add({ id, champ: myChamp.n, role: myRole, win, hints, items: r.build.map(b => b.en),
      enemies: LANES.map(l => enemies[l.id]).filter(Boolean), ts: id })
    setSaved(id)
  }
  if (saved && noted) return <p className="mt-6 text-sm text-chalk-dim">{t('noteSaved')}</p>
  if (saved) return (
    <div className="mt-6">
      <p className="mb-1 text-sm text-chalk-dim">{t('logSaved')}</p>
      <p className="mb-2 font-semibold">{t('noteAsk')}</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {NOTE_TAGS.map(k => (
          <button key={k} type="button" aria-pressed={tags.includes(k)} onClick={() => setTags(x => x.includes(k) ? x.filter(y => y !== k) : [...x, k])}
            className={`h-10 rounded-full border px-4 text-sm font-semibold ${tags.includes(k) ? 'border-marker bg-marker text-marker-ink' : 'border-line bg-felt-2'}`}>{t(k)}</button>
        ))}
      </div>
      <input value={note} onChange={e => setNote(e.target.value)} placeholder={t('notePlaceholder')} maxLength={140}
        className="mb-2 h-12 w-full rounded-xl border border-line bg-felt-2 px-3 outline-none focus:border-marker" />
      <button type="button" onClick={() => { update(saved, { tags, note: note.trim() }); setNoted(true) }}
        className="h-12 w-full rounded-xl border border-line bg-felt-2 font-semibold">{t('noteSave')}</button>
    </div>
  )
  return (
    <div className="mt-6">
      <p className="mb-2 font-semibold">{t('logAsk')}</p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => save(true)} className="h-12 rounded-xl border border-line bg-felt-2 font-semibold">{t('logWin')}</button>
        <button type="button" onClick={() => save(false)} className="h-12 rounded-xl border border-line bg-felt-2 font-semibold">{t('logLoss')}</button>
      </div>
    </div>
  )
}

function ChampStats() {
  const { t } = useT()
  const champ = useMatchStore(s => s.myChamp)
  const entries = useMatchLog(s => s.entries)
  const mine = entries.filter(e => e.champ === champ?.n)
  const s = wl(mine)
  return (
    <div className="mb-6">
      <SectionTitle>{t('statsWith')}</SectionTitle>
      {mine.length === 0 ? <p className="text-sm text-chalk-dim">{t('statsNone')}</p> : (
        <p className="text-lg font-semibold">{s.w} {t('wins')} · {s.l} {t('losses')} · {pct(s)}%</p>
      )}
    </div>
  )
}

function Skeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      {[0, 1, 2, 3].map(i => <div key={i} className="mb-3 h-20 rounded-xl border border-line bg-felt-2" />)}
    </div>
  )
}

function PlanTab({ r }) {
  const { t } = useT()
  const skills = (r.orden_habilidades || '').split('>').map(s => s.split('—')[0].trim()).filter(Boolean)
  return (
    <>
      <ChampStats />
      {r.consejo && (
        <div className="mb-6 flex gap-3 rounded-xl bg-felt-3 p-4">
          <Lightbulb size={20} className="mt-0.5 shrink-0 text-marker" aria-hidden />
          <div>
            <p className="mb-1 font-semibold">{t('tip')}</p>
            <p className="leading-snug">{r.consejo}</p>
          </div>
        </div>
      )}
      {skills.length > 0 && (
        <div className="mb-6">
          <SectionTitle>{t('skills')}</SectionTitle>
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {skills.map((s, i) => (
              <span key={s + i} className="flex items-center gap-1.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-felt-2 text-lg font-bold">{s}</span>
                {i < skills.length - 1 && <ChevronRight size={16} className="text-chalk-dim" aria-hidden />}
              </span>
            ))}
          </div>
          {r.skillNote && <p className="text-sm leading-snug text-chalk-dim">{r.skillNote}</p>}
        </div>
      )}
      {r.amenazas?.length > 0 && (
        <div className="mb-6">
          <SectionTitle>{t('threats')}</SectionTitle>
          <div className="flex flex-wrap gap-2">{r.amenazas.map((a, i) => <TypeTag key={i}>{a.l}</TypeTag>)}</div>
        </div>
      )}
      {r.sinergias?.length > 0 && (
        <div>
          <SectionTitle>{t('synergies')}</SectionTitle>
          <div className="flex flex-wrap gap-2">{r.sinergias.map((a, i) => <TypeTag key={i}>{a.l}</TypeTag>)}</div>
        </div>
      )}
    </>
  )
}

export default function BuildView({ result: r, loading, error, onImprove, canImprove, aiStatus, onApplyLate, waiting }) {
  const { t } = useT()
  const [tab, setTab] = useState('items')
  const myRole = useMatchStore(s => s.myRole)

  if (!r) return <p className="py-16 text-center text-chalk-dim">{t('buildEmpty')}</p>

  return (
    <section aria-label="Build">
      <div className="mb-2 hidden items-center gap-2 short:flex">
        <p className="min-w-0 flex-1 truncate font-semibold">{r.campeon}</p>
        <BubbleButton />
      </div>
      <header className="mb-4 flex items-center gap-3 short:hidden">
        <Token name={r.campeon} side="me" lane={ROLE_LANE[myRole]} size={56} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold leading-tight">{r.campeon}</h1>
          <p className="text-sm text-chalk-dim">{t('role.' + r.carril) !== 'role.' + r.carril ? t('role.' + r.carril) : r.carril} · {t('patch')} {GAME.patch}</p>
        </div>
        <BubbleButton />
      </header>

      <div role="tablist" className="sticky top-0 z-10 mb-4 short:mb-2 grid grid-cols-3 gap-1 rounded-xl border border-line bg-felt-2 p-1">
        {TABS.map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`h-10 rounded-lg text-sm font-semibold ${tab === k ? 'bg-marker text-marker-ink' : 'text-chalk-dim'}`}>{t(l)}</button>
        ))}
      </div>

      {aiStatus === 'waiting' && <p className="mb-3 flex items-center gap-2 text-sm text-chalk-dim"><Loader2 size={16} className="animate-spin" aria-hidden /> {t('aiWorking')}</p>}
      {aiStatus === 'done' && <p className="mb-3 flex items-center gap-2 text-sm text-chalk-dim"><Sparkles size={16} aria-hidden /> {t('aiDone')}</p>}
      {aiStatus === 'error' && <p className="mb-3 text-sm text-chalk-dim">{t('aiFallback')}</p>}
      {aiStatus === 'late' && (
        <button type="button" onClick={onApplyLate} className="mb-3 flex h-11 w-full items-center justify-between rounded-xl border border-marker px-4 text-sm font-semibold">
          <span className="flex items-center gap-2"><Sparkles size={16} aria-hidden /> {t('aiLate')}</span><span>{t('aiApply')}</span>
        </button>
      )}

      {waiting ? <Skeleton /> : <>
      {tab === 'items' && <ItemsTab r={r} />}
      {tab === 'runes' && <RunesTab r={r} />}
      {tab === 'plan' && <PlanTab r={r} />}
      </>}

      <ResultLog key={r.campeon + JSON.stringify(useMatchStore.getState().enemies)} r={r} />

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-foe/50 p-3 text-sm">
          <p className="font-semibold text-foe">{t('errorTitle')}</p>
          <p className="text-chalk-dim">{error}</p>
          <p className="text-chalk-dim">{t('errorHelp')}</p>
        </div>
      )}
      {canImprove && aiStatus !== 'done' && aiStatus !== 'waiting' && (
        <button type="button" onClick={onImprove} disabled={loading}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line bg-felt-2 font-semibold disabled:opacity-50">
          <Sparkles size={18} aria-hidden /> {loading ? t('consulting') : t('improveAI')}
        </button>
      )}
    </section>
  )
}
