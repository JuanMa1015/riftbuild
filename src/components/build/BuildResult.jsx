import { ChampImg, ItemImg, RuneImg, SpellImg, Tag, Card, TipBox } from '../ui'

// ── Item strip with tooltip on hover ──────────────────
function ItemChip({ item, index }) {
  return (
    <div className="flex flex-col items-center gap-1 w-[68px] relative group cursor-default">
      <div className="absolute -top-1.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--gold)] text-black text-[9px] font-black flex items-center justify-center z-10">
        {index + 1}
      </div>
      <ItemImg en={item.en} alt={item.nombre} size={52} className="rounded-[8px] border border-[var(--border2)]" />
      <span className="text-[9.5px] text-[var(--text2)] text-center leading-tight break-words max-w-[66px]">
        {item.nombre}
      </span>
      {/* Tooltip */}
      <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 translate-y-1 
        w-[180px] bg-[var(--bg3)] border border-[var(--border2)] rounded-[8px] 
        px-2.5 py-2 text-[11px] text-[var(--text)] leading-relaxed
        opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0
        transition-all duration-150 z-[300] shadow-[0_8px_32px_rgba(0,0,0,0.65)]">
        <strong className="text-[var(--gold2)] block mb-0.5 text-[12px]">{item.nombre}</strong>
        {item.por_que}
      </div>
    </div>
  )
}

// ── Why row (full explanation per item) ────────────────
const TIPO_CLS = {
  Ofensivo: "bg-[rgba(181,48,31,0.2)] text-[var(--red3)]",
  Defensivo:"bg-[rgba(45,159,216,0.18)] text-[var(--blue3)]",
  Botas:    "bg-[rgba(34,168,85,0.15)] text-[var(--green3)]",
  Híbrido:  "bg-[rgba(200,155,60,0.13)] text-[var(--gold2)]",
}
function WhyRow({ item, index }) {
  return (
    <div className="flex gap-2.5 items-start bg-[var(--bg3)] rounded-[6px] px-3 py-2.5">
      <div className="w-5 h-5 rounded-full bg-[var(--gold)] text-black text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
        {index + 1}
      </div>
      <ItemImg en={item.en} alt={item.nombre} size={36} className="rounded-[6px] border border-[var(--border)] flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className="text-[13px] font-bold">{item.nombre}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TIPO_CLS[item.tipo] || TIPO_CLS.Híbrido}`}>
            {item.tipo}
          </span>
        </div>
        <p className="text-[12px] text-[var(--text2)] leading-snug">{item.por_que}</p>
      </div>
    </div>
  )
}

// ── Rune row ───────────────────────────────────────────
function RuneRow({ rune }) {
  const isKs = rune.slot === "Keystone"
  return (
    <div className="flex items-start gap-2.5 bg-[var(--bg3)] rounded-[6px] px-3 py-2.5">
      <RuneImg name={rune.n || rune.nombre || ""} size={40} className="rounded-full border border-[var(--border2)] flex-shrink-0" />
      <div>
        <div className={`text-[10px] font-extrabold uppercase tracking-[.06em] mb-0.5 ${isKs ? "text-[var(--gold2)]" : "text-[var(--blue3)]"}`}>
          {rune.slot}
        </div>
        <div className="text-[13px] font-bold">{rune.n || rune.nombre}</div>
        <p className="text-[12px] text-[var(--text2)] leading-snug mt-0.5">{rune.p || rune.por_que}</p>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────
export default function BuildResult({ build }) {
  const {
    campeon, carril, amenazas=[], sinergias=[],
    build:items=[], botas, runas=[], hechizos=[],
    orden_habilidades, skillNote, consejo
  } = build

  const skillParts = (orden_habilidades||"").split(">").map(s=>s.split("—")[0].trim()).filter(Boolean)

  return (
    <div className="flex flex-col gap-3">

      {/* Hero card */}
      <Card>
        <div className="flex items-center gap-3.5">
          <ChampImg name={campeon} size={64} className="rounded-[11px] border-2 border-[var(--gold)] flex-shrink-0" />
          <div>
            <div className="text-[22px] font-black text-[var(--gold2)] tracking-tight">{campeon}</div>
            <div className="text-[12px] text-[var(--text2)] mt-0.5">{carril} · Wild Rift · Patch 7.1e</div>
            {(amenazas.length > 0 || sinergias.length > 0) && (
              <div className="flex flex-wrap gap-1 mt-2">
                {amenazas.map((a,i) => <Tag key={i} cls={a.cls}>{a.l}</Tag>)}
                {sinergias.map((s,i) => <Tag key={i} cls={s.cls}>{s.l}</Tag>)}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Items strip */}
      <Card title="⚔️ Orden de compra">
        <div className="flex flex-wrap gap-2 mb-2">
          {items.map((it, i) => <ItemChip key={i} item={it} index={i} />)}
        </div>
        <p className="text-[11px] text-[var(--text3)] mt-1">Pasa el cursor sobre cada ítem para ver el resumen.</p>
      </Card>

      {/* Why */}
      <Card title="📖 Por qué cada ítem">
        <div className="flex flex-col gap-1.5">
          {items.map((it, i) => <WhyRow key={i} item={it} index={i} />)}
        </div>
      </Card>

      {/* Boots */}
      {botas && (
        <Card title="👟 Botas + Encantamiento">
          <div className="flex items-start gap-3">
            <ItemImg en={botas.en} alt={botas.nombre} size={48} className="rounded-[8px] border border-[var(--border2)] flex-shrink-0" />
            <div>
              <div className="text-[14px] font-bold">{botas.nombre}</div>
              <div className="text-[12px] text-[var(--gold)] font-semibold mt-0.5">+ Encantamiento: {botas.encantamiento}</div>
              <p className="text-[12px] text-[var(--text2)] mt-1 leading-snug">{botas.por_que}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Runes */}
      <Card title="💎 Runas">
        <div className="flex flex-col gap-1.5">
          {runas.map((r, i) => <RuneRow key={i} rune={r} />)}
        </div>
      </Card>

      {/* Skill order */}
      {skillParts.length > 0 && (
        <Card title="🎮 Orden de habilidades">
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            {skillParts.map((p, i) => (
              <>
                <div key={p+i} className="w-8 h-8 rounded-[5px] bg-[var(--bg4)] border border-[var(--border2)] flex items-center justify-center text-[14px] font-black text-[var(--gold2)]">
                  {p}
                </div>
                {i < skillParts.length - 1 && <span key={"sep"+i} className="text-[var(--text3)] text-[12px]">›</span>}
              </>
            ))}
          </div>
          {skillNote && <p className="text-[12px] text-[var(--text2)] leading-snug">{skillNote}</p>}
        </Card>
      )}

      {/* Summoner spells */}
      {hechizos.length > 0 && (
        <Card title="⚡ Hechizos de invocador">
          <div className="flex gap-2 flex-wrap">
            {hechizos.map(h => (
              <div key={h} className="flex items-center gap-2 bg-[var(--bg3)] border border-[var(--border)] rounded-[6px] px-3.5 py-2">
                <SpellImg name={h} size={34} className="rounded-[6px]" />
                <span className="text-[13px] font-bold">{h}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tip */}
      {consejo && (
        <Card title="💡 Consejo táctico">
          <TipBox>
            <strong className="text-[var(--gold2)]">Para esta partida: </strong>
            {consejo}
          </TipBox>
        </Card>
      )}
    </div>
  )
}
