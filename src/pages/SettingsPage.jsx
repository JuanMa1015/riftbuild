import { useState } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useAIStore, AI_PROVIDERS, useMatchStore } from '../store'
import { useT, useLang, LANGS } from '../i18n'
import { GAME } from '../data/game'
import { checkForUpdates } from '../lib/updater'
import { bubbleSupported, useBubble } from '../lib/bubble'
import { SectionTitle } from '../components/ui'

const seg = on => `h-11 rounded-lg px-3 text-sm font-semibold ${on ? 'bg-marker text-marker-ink' : 'text-chalk-dim'}`

export default function SettingsPage() {
  const { t } = useT()
  const setView = useMatchStore(s => s.setView)
  const { lang, setLang } = useLang()
  const { provider, key, model, setProvider, setKey, setModel } = useAIStore()
  const { on, toggle } = useBubble()
  const [done, setDone] = useState(false)
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
            {cfg?.docsUrl && (
              <p className="text-sm text-chalk-dim">{t('aiKeyAt')}{' '}
                <a href={cfg.docsUrl} target="_blank" rel="noreferrer" className="text-marker underline underline-offset-2">{cfg.docsUrl.replace('https://', '').split('/')[0]}</a>
              </p>
            )}
          </div>
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
    </div>
  )
}
