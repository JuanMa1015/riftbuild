import { useState } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useAIStore, AI_PROVIDERS, useMatchStore, useMatchLog, useTimerStore } from '../store'
import { useT, useLang, LANGS } from '../i18n'
import { GAME } from '../data/game'
import { checkForUpdates } from '../lib/updater'
import { bubbleSupported, useBubble } from '../lib/bubble'
import { SectionTitle } from '../components/ui'
import { version } from '../../package.json'

const seg = on => `h-11 rounded-lg px-3 text-sm font-semibold ${on ? 'bg-marker text-marker-ink' : 'text-chalk-dim'}`

export default function SettingsPage() {
  const { t } = useT()
  const setView = useMatchStore(s => s.setView)
  const { lang, setLang } = useLang()
  const { provider, key, model, auto, setAuto, setProvider, setKey, setModel } = useAIStore()
  const { on, toggle } = useBubble()
  const [done, setDone] = useState(false)
  const { entries, remove } = useMatchLog()
  const { secs, setSecs } = useTimerStore()
  const won = entries.filter(e => e.win).length
  const cfg = AI_PROVIDERS[provider]

  async function refresh() { await checkForUpdates(); setDone(true); setTimeout(() => setDone(false), 2500) }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-10">
      <div className="mb-4 flex items-center gap-2">
        <button type="button" onClick={() => setView('flow')} aria-label={t('back')}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-felt-2"><ArrowLeft size={22} /></button>
        <h1 className="text-xl font-semibold">{t('settings')}</h1>
      </div>

      <section className="mb-8">
        <SectionTitle>{t('language')}</SectionTitle>
        <div role="radiogroup" className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-felt-2 p-1">
          {Object.entries(LANGS).map(([k, l]) => (
            <button key={k} type="button" role="radio" aria-checked={lang === k} onClick={() => setLang(k)} className={seg(lang === k)}>{l}</button>
          ))}
        </div>
      </section>

      {bubbleSupported && (
        <section className="mb-8">
          <SectionTitle>{t('bubble')}</SectionTitle>
          <p className="mb-3 text-sm text-chalk-dim">{t('bubbleHelp')}</p>
          <button type="button" onClick={toggle}
            className={`h-12 w-full rounded-xl font-semibold ${on ? 'border border-line bg-felt-2' : 'bg-marker text-marker-ink'}`}>
            {on ? t('bubbleOn') : t('bubbleOff')}
          </button>
        </section>
      )}

      <section className="mb-8">
        <SectionTitle>{t('ai')}</SectionTitle>
        <div role="radiogroup" className="mb-3 grid grid-cols-4 gap-1 rounded-xl border border-line bg-felt-2 p-1">
          {Object.entries(AI_PROVIDERS).map(([k, p]) => (
            <button key={k} type="button" role="radio" aria-checked={provider === k} onClick={() => setProvider(k)}
              className={`${seg(provider === k)} px-1 text-xs`}>{p.label.split(' ')[0]}</button>
          ))}
        </div>
        {provider === 'local' ? (
          <p className="text-sm text-chalk-dim">{t('aiLocalNote')}</p>
        ) : (
          <div className="flex flex-col gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-chalk-dim">API key</span>
              <input type="password" value={key} onChange={e => setKey(e.target.value)} placeholder={`${t('aiKeyPlaceholder')} ${cfg?.label}`}
                className="h-12 w-full rounded-xl border border-line bg-felt-2 px-3 outline-none focus:border-marker" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-chalk-dim">{t('aiModel')}</span>
              <select value={model || cfg?.models?.[0]} onChange={e => setModel(e.target.value)}
                className="h-12 w-full rounded-xl border border-line bg-felt-2 px-3 outline-none focus:border-marker">
                {cfg?.models?.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label className="flex items-start gap-3">
              <input type="checkbox" checked={auto} onChange={e => setAuto(e.target.checked)} className="mt-1 h-5 w-5 accent-[var(--color-marker)]" />
              <span><span className="block font-medium">{t('aiAuto')}</span><span className="block text-sm text-chalk-dim">{t('aiAutoHint')}</span></span>
            </label>
            {cfg?.docsUrl && (
              <p className="text-sm text-chalk-dim">{t('aiKeyAt')}{' '}
                <a href={cfg.docsUrl} target="_blank" rel="noreferrer" className="text-marker underline underline-offset-2">{cfg.docsUrl.replace('https://', '').split('/')[0]}</a>
              </p>
            )}
          </div>
        )}
      </section>

      {bubbleSupported && (
        <section className="mb-8">
          <SectionTitle>{t('timersTitle')}</SectionTitle>
          <p className="mb-3 text-sm text-chalk-dim">{t('timersHelp')}</p>
          <ul className="flex flex-col gap-2">
            {GAME.timers.map(tm => {
              const v = secs[tm.id] ?? tm.secs
              return (
                <li key={tm.id} className="flex items-center gap-3">
                  <span className="flex-1 font-medium">{lang === 'en' ? tm.en : tm.es}</span>
                  <input type="number" inputMode="numeric" min="10" max="900" value={v} onChange={e => setSecs(tm.id, Math.max(10, Math.min(900, +e.target.value || tm.secs)))}
                    aria-label={lang === 'en' ? tm.en : tm.es}
                    className="h-11 w-24 rounded-xl border border-line bg-felt-2 px-3 text-right outline-none focus:border-marker" />
                  <span className="w-20 text-sm text-chalk-dim">{t('timersSecs')} · {Math.floor(v / 60)}:{String(v % 60).padStart(2, '0')}</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="mb-8">
        <SectionTitle>{t('history')}</SectionTitle>
        {entries.length === 0 ? <p className="text-sm text-chalk-dim">{t('historyEmpty')}</p> : (
          <>
            <p className="mb-3 text-lg font-semibold">{won} {t('wins')} · {entries.length - won} {t('losses')} · {Math.round((100 * won) / entries.length)}%</p>
            <ul className="flex flex-col gap-1.5">
              {entries.slice(0, 8).map(e => (
                <li key={e.id} className="flex items-center gap-2 rounded-xl border border-line bg-felt-2 px-3 py-2 text-sm">
                  <span className={`font-bold ${e.win ? 'text-ally' : 'text-foe'}`}>{e.win ? 'W' : 'L'}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{e.champ} {t('vs')} {e.enemies.join(', ') || '—'}</span>
                    {(e.tags?.length > 0 || e.note) && <span className="block truncate text-chalk-dim">{[...(e.tags || []).map(k => t(k)), e.note].filter(Boolean).join(' · ')}</span>}
                  </span>
                  <button type="button" onClick={() => remove(e.id)} className="h-9 rounded-lg px-2 text-chalk-dim">{t('delete')}</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="mb-8">
        <SectionTitle>{t('data')}</SectionTitle>
        <p className="mb-3 text-sm text-chalk-dim">{t('dataInfo', { patch: GAME.patch, version: GAME.version })}</p>
        <button type="button" onClick={refresh}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line bg-felt-2 font-semibold">
          <RefreshCw size={18} aria-hidden /> {done ? t('refreshed') : t('refresh')}
        </button>
      </section>

      <p className="text-sm text-chalk-dim">{t('disclaimer')}</p>
      <p className="mt-1 text-sm text-chalk-dim">RiftBuild v{version}</p>
    </div>
  )
}
