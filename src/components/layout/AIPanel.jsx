import { useState } from 'react'
import { useAIStore, AI_PROVIDERS } from '../../store'

export default function AIPanel() {
  const { provider, key, model, setProvider, setKey, setModel } = useAIStore()
  const [open, setOpen] = useState(false)

  const isActive = provider !== 'local' && key.trim()
  const cfg = AI_PROVIDERS[provider]

  return (
    <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-[10px] mb-3 overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-[var(--bg3)] transition-colors text-left"
      >
        <div className={`w-[7px] h-[7px] rounded-full flex-shrink-0 transition-all ${isActive ? 'bg-[var(--green3)] shadow-[0_0_5px_var(--green2)]' : 'bg-[var(--text3)]'}`} />
        <span className="text-[12px] font-bold text-[var(--text2)]">⚙️ Configuración de IA</span>
        <span className="ml-auto text-[11px] text-[var(--text3)]">
          {isActive ? `${cfg?.label} activo` : "Sin IA · modo local"}
        </span>
        <span className={`text-[9px] text-[var(--text3)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--border)]">
          {/* Provider tabs */}
          <div className="grid grid-cols-4 gap-1 mb-3 mt-3">
            {Object.entries(AI_PROVIDERS).map(([k, p]) => (
              <button
                key={k}
                type="button"
                onClick={() => setProvider(k)}
                className={`py-2 px-1 text-[10px] font-bold rounded-[6px] border text-center transition-all leading-tight
                  ${provider === k
                    ? 'bg-[rgba(200,155,60,0.1)] border-[rgba(200,155,60,0.35)] text-[var(--gold2)]'
                    : 'bg-[var(--bg3)] border-[var(--border)] text-[var(--text3)] hover:text-[var(--text2)] hover:bg-[var(--bg4)]'}`}
              >
                {p.icon}<br />{p.label.split(' ')[0]}<br />
                <span className="text-[9px] opacity-60">{k==='openrouter'?'gratis':k==='local'?'offline':'API key'}</span>
              </button>
            ))}
          </div>

          {provider === 'local' ? (
            <div className="px-3 py-2.5 bg-[var(--bg3)] border-l-[3px] border-l-[var(--gold)] rounded-r-[6px] text-[11px] text-[var(--text2)] leading-relaxed">
              📦 <strong className="text-[var(--text)]">Modo local:</strong> base de datos integrada de builds.
              Funciona 100% offline, sin internet ni API key.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[var(--text3)] uppercase tracking-[.07em] mb-1">API Key</label>
                <input
                  type="password"
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder={`Pega tu ${cfg?.label} API key...`}
                  className="w-full px-2.5 py-2 text-[12px] bg-[var(--bg3)] border border-[var(--border2)] rounded-[6px]
                    text-[var(--text)] placeholder:text-[var(--text3)] outline-none focus:border-[var(--gold)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text3)] uppercase tracking-[.07em] mb-1">Modelo</label>
                <select
                  value={model || cfg?.models?.[0]}
                  onChange={e => setModel(e.target.value)}
                  className="w-full px-2.5 py-2 text-[12px] bg-[var(--bg3)] border border-[var(--border2)] rounded-[6px]
                    text-[var(--text)] outline-none focus:border-[var(--gold)] transition-colors"
                >
                  {cfg?.models?.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {cfg?.note && (
                <div className="px-3 py-2 bg-[var(--bg3)] border-l-[3px] border-l-[var(--gold)] rounded-r-[6px] text-[11px] text-[var(--text2)] leading-relaxed">
                  🆓 {cfg.note}.{' '}
                  <a href={cfg.docsUrl} target="_blank" rel="noreferrer" className="text-[var(--gold2)] hover:underline">
                    {cfg.docsUrl.replace('https://','').split('/')[0]}
                  </a>
                </div>
              )}
              {cfg?.docsUrl && !cfg.note && (
                <div className="text-[11px] text-[var(--text3)]">
                  API key en{' '}
                  <a href={cfg.docsUrl} target="_blank" rel="noreferrer" className="text-[var(--gold2)] hover:underline">
                    {cfg.docsUrl.replace('https://','').split('/')[0]}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
