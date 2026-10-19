import { useState } from 'react'
import { ChevronDown, ChevronRight, Sparkles, Lightbulb, Bubbles } from 'lucide-react'
import { GAME } from '../../data/game'
import { useMatchStore } from '../../store'
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

function PlanTab({ r }) {
  const { t } = useT()
  const skills = (r.orden_habilidades || '').split('>').map(s => s.split('—')[0].trim()).filter(Boolean)
  return (
    <>
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

export default function BuildView({ result: r, loading, error, onImprove, canImprove }) {
  const { t } = useT()
  const [tab, setTab] = useState('items')
  const myRole = useMatchStore(s => s.myRole)
  const bubbleOn = useBubble(s => s.on)
  const toggleBubble = useBubble(s => s.toggle)

  if (!r) return <p className="py-16 text-center text-chalk-dim">{t('buildEmpty')}</p>

  return (
    <section aria-label="Build">
      <div className="mb-2 hidden items-center gap-2 short:flex">
        <p className="min-w-0 flex-1 truncate font-semibold">{r.campeon}</p>
        {bubbleSupported && (
          <button type="button" onClick={toggleBubble} aria-pressed={bubbleOn} aria-label={t('bubble')}
            className={`flex h-11 w-11 items-center justify-center rounded-full border ${bubbleOn ? 'border-marker bg-marker text-marker-ink' : 'border-line bg-felt-2'}`}>
            <Bubbles size={20} />
          </button>
        )}
      </div>
      <header className="mb-4 flex items-center gap-3 short:hidden">
        <Token name={r.campeon} side="me" lane={ROLE_LANE[myRole]} size={56} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold leading-tight">{r.campeon}</h1>
          <p className="text-sm text-chalk-dim">{t('role.' + r.carril) !== 'role.' + r.carril ? t('role.' + r.carril) : r.carril} · {t('patch')} {GAME.patch}</p>
        </div>
        {bubbleSupported && (
          <button type="button" onClick={toggleBubble} aria-pressed={bubbleOn} aria-label={t('bubble')}
            className={`flex h-11 w-11 items-center justify-center rounded-full border ${bubbleOn ? 'border-marker bg-marker text-marker-ink' : 'border-line bg-felt-2'}`}>
            <Bubbles size={20} />
          </button>
        )}
      </header>

      <div role="tablist" className="sticky top-0 z-10 mb-4 short:mb-2 grid grid-cols-3 gap-1 rounded-xl border border-line bg-felt-2 p-1">
        {TABS.map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`h-10 rounded-lg text-sm font-semibold ${tab === k ? 'bg-marker text-marker-ink' : 'text-chalk-dim'}`}>{t(l)}</button>
        ))}
      </div>

      {tab === 'items' && <ItemsTab r={r} />}
      {tab === 'runes' && <RunesTab r={r} />}
      {tab === 'plan' && <PlanTab r={r} />}

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-foe/50 p-3 text-sm">
          <p className="font-semibold text-foe">{t('errorTitle')}</p>
          <p className="text-chalk-dim">{error}</p>
          <p className="text-chalk-dim">{t('errorHelp')}</p>
        </div>
      )}
      {canImprove && (
        <button type="button" onClick={onImprove} disabled={loading}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line bg-felt-2 font-semibold disabled:opacity-50">
          <Sparkles size={18} aria-hidden /> {loading ? t('consulting') : t('improveAI')}
        </button>
      )}
    </section>
  )
}
