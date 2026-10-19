import { LANES, CHAMPIONS } from '../../data/champions'
import { useMatchStore } from '../../store'
import ChampionPicker from './ChampionPicker'

function LaneRow({ laneId, laneIco, laneLbl, value, onChange }) {
  const champ = value ? CHAMPIONS.find(c => c.n === value) : null
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-[14px] w-5 text-center flex-shrink-0">{laneIco}</span>
      <span className="text-[9px] font-extrabold text-[var(--text3)] uppercase tracking-[.05em] w-8 flex-shrink-0">{laneLbl}</span>
      <div className="flex-1">
        <ChampionPicker
          value={champ}
          onChange={c => onChange(laneId, c?.n || "")}
          placeholder="Elegir..."
          size="sm"
        />
      </div>
    </div>
  )
}

export default function TeamGrid() {
  const { allies, enemies, setAlly, setEnemy, clearTeams } = useMatchStore()

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[12px] font-bold text-[var(--text2)]">
          🗺️ Composición{" "}
          <span className="text-[var(--text3)] font-normal text-[11px]">(opcional, mejora mucho la build)</span>
        </span>
        <button
          type="button"
          onClick={clearTeams}
          className="text-[11px] text-[var(--text3)] hover:text-[var(--text2)] transition-colors bg-none border-none cursor-pointer px-1.5 py-0.5 rounded"
        >
          Limpiar ✕
        </button>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-3">
        {/* Allies */}
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[.05em] text-[var(--blue3)] mb-2 flex items-center gap-1.5">
            🔵 Aliados
          </div>
          {LANES.map(l => (
            <LaneRow
              key={l.id}
              laneId={l.id}
              laneIco={l.ico}
              laneLbl={l.lbl}
              value={allies[l.id]}
              onChange={setAlly}
            />
          ))}
        </div>

        {/* Enemies */}
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[.05em] text-[var(--red3)] mb-2 flex items-center gap-1.5">
            🔴 Enemigos
          </div>
          {LANES.map(l => (
            <LaneRow
              key={l.id}
              laneId={l.id}
              laneIco={l.ico}
              laneLbl={l.lbl}
              value={enemies[l.id]}
              onChange={setEnemy}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
