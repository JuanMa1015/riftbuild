import { TYPE_COLOR, TYPE_LABEL } from '../../data/champions'
import { GAME, REPO_RAW } from '../../data/game'
import { useT } from '../../i18n'

const FB = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='48' height='48' rx='8' fill='%23242432'/><text x='24' y='32' text-anchor='middle' font-size='20'>?</text></svg>`
const slug = n => n.toLowerCase().replace(/[^a-z0-9]/g, '')

// Images ship inside the app (public/champs, items, runes, spells). Anything added by a data update
// is not in the APK yet, so on a miss we try the repo copy once before showing "?".
const onErr = e => {
  const t = e.target
  if (!t.dataset.retried && t.dataset.path) { t.dataset.retried = '1'; t.src = REPO_RAW + t.dataset.path; return }
  t.onerror = null; t.src = FB
}

function Img({ path, alt, size, className }) {
  return <img src={import.meta.env.BASE_URL + path} data-path={path} alt={alt} width={size} height={size}
    className={`object-cover bg-[var(--bg4)] ${className}`} style={{width:size,height:size}} onError={onErr} />
}

export const ChampImg = ({ name, size=48, className="" }) => <Img path={`champs/${slug(name)}.png`} alt={name} size={size} className={className} />
export const ItemImg  = ({ en, alt="", size=52, className="" }) => <Img path={`items/${en}.png`} alt={alt} size={size} className={className} />
// Rune names are stored in Spanish for keystones; the file is named after the English name.
export const RuneImg  = ({ name, size=40, className="" }) => <Img path={`runes/${slug(GAME.en[name] ?? name)}.png`} alt={name} size={size} className={className} />
export const SpellImg = ({ name, size=34, className="" }) => <Img path={`spells/${slug(name)}.png`} alt={name} size={size} className={className} />

export function TypeBadge({ type, small=false }) {
  const { tr } = useT()
  return (
    <span className={`font-bold rounded px-1.5 ${small?'text-[9px] py-0.5':'text-[10px] py-0.5'}`}
      style={{background: TYPE_COLOR[type]||'#555', color:'#000'}}>
      {tr(TYPE_LABEL[type]||type)}
    </span>
  )
}

const TAG_CLS = {
  'tag-r':    'bg-[rgba(181,48,31,0.18)]   text-[var(--red3)]    border border-[rgba(181,48,31,0.3)]',
  'tag-b':    'bg-[rgba(45,159,216,0.14)]  text-[var(--blue3)]   border border-[rgba(45,159,216,0.25)]',
  'tag-g':    'bg-[rgba(34,168,85,0.14)]   text-[var(--green3)]  border border-[rgba(34,168,85,0.25)]',
  'tag-gold': 'bg-[rgba(200,155,60,0.13)]  text-[var(--gold2)]   border border-[rgba(200,155,60,0.25)]',
  'tag-p':    'bg-[rgba(139,68,204,0.15)]  text-[var(--purple3)] border border-[rgba(139,68,204,0.25)]',
}
export function Tag({ cls, children }) {
  return <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${TAG_CLS[cls]||TAG_CLS['tag-r']}`}>{children}</span>
}

export function Card({ title, children, className="" }) {
  return (
    <div className={`bg-[var(--bg2)] border border-[var(--border)] rounded-[10px] overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 py-2.5 border-b border-[var(--border)] bg-white/[0.02] flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--gold)]">{title}</span>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}

export function TipBox({ children }) {
  return (
    <div className="bg-[rgba(200,155,60,0.06)] border border-[rgba(200,155,60,0.16)] border-l-[3px] border-l-[var(--gold)] rounded-r-[6px] px-3.5 py-2.5 text-[13px] text-[var(--text2)] leading-relaxed">
      {children}
    </div>
  )
}

export function Spinner({ size=10 }) {
  return <div className={`w-${size} h-${size} rounded-full border-[3px] border-[var(--bg5)] border-t-[var(--gold)] animate-spin`} />
}
