import { Shield, TreePine, Zap, Crosshair, HeartHandshake, X } from 'lucide-react'
import { GAME, REPO_RAW } from '../../data/game'

const FB = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='48' height='48' fill='%231b4631'/><text x='24' y='32' text-anchor='middle' font-size='20' fill='%23a9c0b0'>?</text></svg>`
const FB_ITEM = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='48' height='48' fill='%231b4631'/><path d='M24 9l12 4v10c0 8-5 13-12 16C17 36 12 31 12 23V13z' fill='none' stroke='%23a9c0b0' stroke-width='2.5' stroke-linejoin='round'/></svg>`
const slug = n => n.toLowerCase().replace(/[^a-z0-9]/g, '')

// Images ship inside the app (public/champs, items, runes, spells). Anything added by a data update
// is not in the APK yet, so on a miss we try the repo copy once before showing "?".
const onErr = e => {
  const t = e.target
  if (!t.dataset.retried && t.dataset.path) { t.dataset.retried = '1'; t.src = REPO_RAW + t.dataset.path; return }
  t.onerror = null; t.src = t.dataset.path?.startsWith('items/') ? FB_ITEM : FB
}

function Img({ path, alt, size, className = '' }) {
  return <img src={import.meta.env.BASE_URL + path} data-path={path} alt={alt} width={size} height={size}
    decoding="async" loading="lazy"
    className={`object-cover bg-felt-3 ${className}`} style={{ width: size, height: size }} onError={onErr} />
}

export const ChampImg = ({ name, size = 48, className = '' }) => <Img path={`champs/${slug(name)}.png`} alt={name} size={size} className={className} />
export const ItemImg  = ({ en, alt = '', size = 52, className = '' }) => <Img path={`items/${en}.png`} alt={alt} size={size} className={className} />
// Rune names are stored in Spanish for keystones; the file is named after the English name.
export const RuneImg  = ({ name, size = 40, className = '' }) => <Img path={`runes/${slug(GAME.en[name] ?? name)}.png`} alt={name} size={size} className={className} />
export const SpellImg = ({ name, size = 34, className = '' }) => <Img path={`spells/${slug(name)}.png`} alt={name} size={size} className={className} />

// One drawn glyph per lane, used everywhere a lane appears
export const LANE_ICON = { top: Shield, jg: TreePine, mid: Zap, adc: Crosshair, sup: HeartHandshake }
export const ROLE_LANE = { 'Solo / Baron': 'top', Jungla: 'jg', Mid: 'mid', 'ADC / Duo': 'adc', Support: 'sup' }

export function LaneGlyph({ lane, size = 16, className = '' }) {
  const Icon = LANE_ICON[lane]
  return Icon ? <Icon size={size} strokeWidth={2} className={className} aria-hidden /> : null
}

/**
 * A magnetic token on the board: a circle with the portrait, a ring in the team colour and a lane badge.
 * side: 'me' (marker yellow) | 'ally' | 'foe'. Empty tokens show the lane glyph on a dashed chalk ring.
 */
const RING = { me: 'ring-marker', ally: 'ring-ally', foe: 'ring-foe' }
export function Token({ name, side = 'foe', lane, size = 56, active = false, removable = false }) {
  return (
    <span key={name || 'empty'} className={`relative inline-flex rounded-full ${name ? 'drop' : ''}`} style={{ width: size, height: size }}>
      {name ? (
        <ChampImg name={name} size={size} className={`rounded-full ${size < 48 ? 'ring-2' : 'ring-[3px]'} ${RING[side]}`} />
      ) : (
        <span className={`flex items-center justify-center rounded-full border-2 border-dashed
          ${active ? 'border-marker text-marker' : 'border-line text-chalk-dim'}`} style={{ width: size, height: size }}>
          <LaneGlyph lane={lane} size={Math.round(size * 0.4)} />
        </span>
      )}
      {name && removable && (
        <span aria-hidden className="absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-felt border border-line text-chalk"
          style={{ width: size * 0.34, height: size * 0.34 }}><X size={Math.round(size * 0.2)} strokeWidth={3} /></span>
      )}
      {name && lane && (
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-felt border border-line text-chalk"
          style={{ width: size * 0.38, height: size * 0.38 }}>
          <LaneGlyph lane={lane} size={Math.round(size * 0.22)} />
        </span>
      )}
    </span>
  )
}

export function TypeTag({ children }) {
  return <span className="inline-flex items-center rounded-full border border-line px-2 py-0.5 text-xs font-semibold text-chalk-dim">{children}</span>
}

export function SectionTitle({ children, aside }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-2">
      <h2 className="text-lg font-semibold tracking-tight">{children}</h2>
      {aside}
    </div>
  )
}
