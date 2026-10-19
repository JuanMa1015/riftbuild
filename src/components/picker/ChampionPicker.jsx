import { useState, useRef, useEffect, useMemo } from 'react'
import { CHAMPIONS, TYPE_COLOR, TYPE_LABEL, ROLE_MAP } from '../../data/champions'
import { ChampImg, TypeBadge } from '../ui'
import { useT } from '../../i18n'

const TYPE_FILTERS = ["all","fighter","mage","assassin","marksman","tank","support"]
const LANE_FILTERS = ["Solo","Jungla","Mid","ADC","Support"]
const LANE_ICONS   = {Solo:"🛡️",Jungla:"🌲",Mid:"⚡",ADC:"🏹",Support:"💛"}

const PILL_BASE = "px-2.5 py-1 text-[10px] font-bold rounded-full border cursor-pointer transition-all duration-100 whitespace-nowrap flex-shrink-0 select-none"
const PILL_OFF  = "border-[var(--border)] bg-[var(--bg4)] text-[var(--text3)] hover:text-[var(--text2)] hover:border-[var(--border2)]"

const TYPE_ACTIVE_BG = {
  all:"#8a8070", fighter:"#e8a020", mage:"#6680ff",
  assassin:"#cc2244", marksman:"#2db85a", tank:"#4a8fbf", support:"#9b55d4",
}

// ── Memoized grid item ─────────────────────────────────
function ChampCard({ champ, selected, onPick, size=48 }) {
  const { tr } = useT()
  const col = TYPE_COLOR[champ.t] || '#888'
  return (
    <button
      onClick={() => onPick(champ)}
      className={`flex flex-col items-center gap-1 p-1.5 rounded-[6px] border cursor-pointer transition-all duration-100
        ${selected
          ? 'border-[var(--gold)] bg-[rgba(200,155,60,0.12)]'
          : 'border-transparent bg-[var(--bg3)] hover:border-[var(--border2)] hover:bg-[var(--bg4)] hover:-translate-y-px'}`}
    >
      <ChampImg name={champ.n} size={size} className="rounded-[7px]" />
      <span className="text-[9px] text-[var(--text2)] text-center leading-tight break-words w-full">{tr(champ.n)}</span>
      <span className="text-[8px] text-center" style={{color:col}}>{tr(TYPE_LABEL[champ.t])}</span>
    </button>
  )
}

// ── Grouped grid ───────────────────────────────────────
function GroupedGrid({ champs, selectedName, onPick, itemSize }) {
  const { t } = useT()
  const groups = useMemo(() => {
    const g = {Solo:[],Jungla:[],Mid:[],ADC:[],Support:[]}
    champs.forEach(c => { const r = c.r[0]||"Solo"; if(g[r]) g[r].push(c) })
    return g
  }, [champs])

  return (
    <>
      {Object.entries(groups).map(([lane, list]) => list.length === 0 ? null : (
        <div key={lane}>
          <div className="text-[9px] font-extrabold text-[var(--text3)] uppercase tracking-widest
            px-1 pt-2 pb-1 border-t border-[var(--border)] first:border-t-0 first:pt-0 col-span-full">
            {LANE_ICONS[lane]} {t('lane.'+lane)}
          </div>
          {list.map(c => (
            <ChampCard key={c.n} champ={c} selected={c.n===selectedName} onPick={onPick} size={itemSize} />
          ))}
        </div>
      ))}
    </>
  )
}

// ── Main picker component ──────────────────────────────
export default function ChampionPicker({
  value,           // champion object or null
  onChange,        // (champ) => void
  onRoleChange,    // optional: auto-set role when picking
  placeholder,
  size = "md",     // "md" | "sm"
}) {
  const { t, tr } = useT()
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState("")
  const [typeF, setTypeF]   = useState("all")
  const [laneF, setLaneF]   = useState("all")
  const wrapRef  = useRef(null)
  const searchRef = useRef(null)
  const isSm = size === "sm"

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Focus search when opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 60)
    else { setSearch(""); setTypeF("all"); setLaneF("all") }
  }, [open])

  const filtered = useMemo(() => {
    let list = CHAMPIONS
    if (search.trim()) list = list.filter(c => c.n.toLowerCase().includes(search.toLowerCase()))
    if (typeF !== "all") list = list.filter(c => c.t === typeF)
    if (laneF !== "all") list = list.filter(c => c.r.includes(laneF))
    return list
  }, [search, typeF, laneF])

  const isGrouped = !search.trim() && typeF === "all" && laneF === "all"
  const itemSize  = isSm ? 38 : 46

  function pick(champ) {
    onChange(champ)
    if (onRoleChange && champ.r[0] && ROLE_MAP[champ.r[0]]) onRoleChange(ROLE_MAP[champ.r[0]])
    setOpen(false)
  }
  function clear(e) {
    e.stopPropagation()
    onChange(null)
  }

  const triggerH = isSm ? "min-h-[34px] px-2 py-1.5 gap-1.5" : "min-h-[44px] px-3 py-2 gap-2.5"

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center ${triggerH} bg-[var(--bg3)]
          border rounded-[6px] cursor-pointer transition-all duration-150 text-left
          ${open
            ? "border-[var(--gold)] rounded-b-none bg-[var(--bg4)]"
            : value
              ? "border-[rgba(200,155,60,0.4)] hover:border-[var(--gold)] hover:bg-[var(--bg4)]"
              : "border-[var(--border2)] hover:border-[var(--gold)] hover:bg-[var(--bg4)]"}`}
      >
        {value ? (
          <>
            <ChampImg name={value.n} size={isSm?24:30} className={`rounded-[${isSm?'4':'5'}px] flex-shrink-0`} />
            <span className={`flex-1 font-semibold ${isSm?'text-[12px]':'text-[13px]'}`}>{tr(value.n)}</span>
            {!isSm && <TypeBadge type={value.t} small />}
            <button
              type="button"
              onClick={clear}
              className="w-5 h-5 rounded-full bg-[var(--bg5)] text-[var(--text3)] text-[12px]
                flex items-center justify-center flex-shrink-0 ml-1 hover:bg-[var(--red3)] hover:text-white transition-colors"
            >×</button>
          </>
        ) : (
          <span className={`flex-1 text-[var(--text3)] ${isSm?'text-[11px]':'text-[12px]'}`}>{placeholder || t('pick')}</span>
        )}
        <span className={`text-[var(--text3)] text-[9px] ml-1 transition-transform duration-200 flex-shrink-0 ${open?'rotate-180':''}`}>▼</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-[500] bg-[var(--bg2)]
          border border-[var(--gold)] border-t-[var(--border2)]
          rounded-b-[6px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.7)]
          flex flex-col">

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg3)] border-b border-[var(--border)] flex-shrink-0">
            <span className="text-[var(--text3)] text-[13px]">🔍</span>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && filtered.length === 1) pick(filtered[0])
                if (e.key === "Escape") setOpen(false)
              }}
              placeholder={t('searchName')}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--text)] placeholder:text-[var(--text3)]"
            />
            {search && (
              <button type="button" onClick={()=>setSearch("")} className="text-[var(--text3)] hover:text-[var(--text2)] text-[14px] leading-none">×</button>
            )}
          </div>

          {/* Type filters */}
          <div className="flex gap-1 px-2.5 py-1.5 border-b border-[var(--border)] overflow-x-auto scrollbar-thin flex-shrink-0 bg-[var(--bg3)]">
            {TYPE_FILTERS.map(v => ({v})).map(f => {
              const active = typeF === f.v
              const bg = TYPE_ACTIVE_BG[f.v]
              return (
                <button
                  key={f.v}
                  type="button"
                  onClick={() => { setTypeF(f.v); setLaneF("all") }}
                  className={`${PILL_BASE} ${active ? '' : PILL_OFF}`}
                  style={active ? {background:bg, color:'#000', border:`1px solid ${bg}`} : {}}
                >
                  {f.v === 'all' ? t('all') : tr(TYPE_LABEL[f.v])}
                </button>
              )
            })}
            <span className="inline-block w-px h-4 bg-[var(--border2)] mx-1 self-center flex-shrink-0" />
            {LANE_FILTERS.map(l => {
              const active = laneF === l
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => { setLaneF(laneF===l?"all":l); setTypeF("all") }}
                  className={`${PILL_BASE} ${active ? '' : PILL_OFF}`}
                  style={active ? {background:"var(--gold)", color:'#000', border:"1px solid var(--gold)"} : {}}
                >
                  {LANE_ICONS[l]} {t('lane.'+l)}
                </button>
              )
            })}
          </div>

          {/* Grid */}
          <div className="overflow-y-auto max-h-[260px] p-2">
            {filtered.length === 0 ? (
              <div className="text-center py-6 text-[var(--text3)] text-[12px]">{t('noResults')}</div>
            ) : isGrouped ? (
              <div className="grid gap-1.5" style={{gridTemplateColumns:`repeat(auto-fill,minmax(${itemSize+16}px,1fr))`}}>
                <GroupedGrid champs={filtered} selectedName={value?.n} onPick={pick} itemSize={itemSize} />
              </div>
            ) : (
              <div className="grid gap-1.5" style={{gridTemplateColumns:`repeat(auto-fill,minmax(${itemSize+16}px,1fr))`}}>
                {filtered.map(c => (
                  <ChampCard key={c.n} champ={c} selected={c.n===value?.n} onPick={pick} size={itemSize} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
