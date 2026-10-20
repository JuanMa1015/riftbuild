import { Settings, Check, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import LangToggle from '../LangToggle'
import { GAME } from '../../data/game'
import { useMatchStore } from '../../store'
import { useT } from '../../i18n'
import { ItemImg } from '../ui'

export function Mark({ size = 26 }) {
  // The app icon: centre circle, halfway line (in two halves) and the yellow token
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="6.6" />
      <path d="M12 2.2V8M12 16V21.8" />
      <circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TopBar() {
  const { t } = useT()
  const setView = useMatchStore(s => s.setView)
  return (
    <header className="pt-safe flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-2 tiny:hidden">
      <span className="flex items-center gap-2 text-marker"><Mark /><span className="text-lg font-bold tracking-tight text-chalk">{t('appName')}</span></span>
      <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold text-chalk-dim short:hidden whitespace-nowrap"><span className="max-[400px]:hidden">{t('patch')} </span>{GAME.patch}</span>
      <span className="ml-auto flex items-center gap-1">
        <LangToggle />
        <button type="button" onClick={() => setView('settings')} aria-label={t('settings')}
          className="flex h-11 w-11 items-center justify-center rounded-full text-chalk-dim hover:bg-felt-2 hover:text-chalk"><Settings size={22} /></button>
      </span>
    </header>
  )
}

// Starts over: champion, rivals, allies and the build go away (recents make picking the same champion one tap)
export function NewMatchButton({ primary = false }) {
  const { t } = useT()
  const newMatch = useMatchStore(s => s.newMatch)
  return (
    <button type="button" onClick={newMatch}
      className={primary
        ? 'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-marker font-bold text-marker-ink'
        : 'flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-semibold text-chalk-dim hover:text-chalk'}>
      <RotateCcw size={primary ? 18 : 15} aria-hidden /> {t('newMatch')}
    </button>
  )
}

// Three steps; later ones unlock as the previous is done.
export function Stepper() {
  const { t } = useT()
  const { step, setStep, myChamp, setView } = useMatchStore()
  const steps = [['stepMe', true], ['stepFoes', true], ['stepBuild', !!myChamp]]
  return (
    <nav aria-label={t('menuFlow')} className="px-4 pb-3 short:pb-2 tiny:pt-2">
      <ol className="grid grid-cols-3 gap-2 tiny:grid-cols-[1fr_1fr_1fr_auto] tiny:gap-1.5">
        {steps.map(([l, enabled], i) => {
          const cur = step === i, done = step > i
          return (
            <li key={l}>
              <button type="button" disabled={!enabled} onClick={() => setStep(i)} aria-current={cur ? 'step' : undefined}
                className={`flex h-11 short:h-9 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold disabled:opacity-40
                  ${cur ? 'border-marker text-chalk' : 'border-line text-chalk-dim'}`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${cur ? 'bg-marker text-marker-ink' : done ? 'bg-chalk text-felt' : 'border border-line'}`}>
                  {done ? <Check size={12} strokeWidth={3} /> : i + 1}
                </span>
                {t(l)}
              </button>
            </li>
          )
        })}
        <li className="hidden tiny:block">
          <button type="button" onClick={() => setView('settings')} aria-label={t('settings')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-chalk-dim"><Settings size={18} /></button>
        </li>
      </ol>
    </nav>
  )
}

// Bottom dock: live peek of the build from the first pick, plus the one primary action.
export function Dock() {
  const { t } = useT()
  const { step, setStep, myChamp, result, newMatch } = useMatchStore()
  const primary = 'flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-marker px-4 font-bold text-marker-ink disabled:opacity-40'
  return (
    <div className="pb-safe border-t border-line bg-felt">
      <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3 short:py-2">
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)} aria-label={t('back')}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line"><ArrowLeft size={20} /></button>
        )}
        {step < 2 && (
          <div className="hidden min-w-0 items-center gap-1 min-[360px]:flex" aria-hidden>
            {result?.build?.slice(0, 3).map((b, i) => <ItemImg key={i} en={b.en} size={32} className="rounded-md" />)}
            {!result && <span className="truncate text-sm text-chalk-dim">{t('dockPick')}</span>}
          </div>
        )}
        {step === 0 && <button type="button" onClick={() => setStep(1)} className={primary}>{t('next')} <ArrowRight size={18} /></button>}
        {step === 1 && <button type="button" disabled={!myChamp} onClick={() => setStep(2)} className={primary}>{t('viewBuild')} <ArrowRight size={18} /></button>}
        {step === 2 && <button type="button" onClick={newMatch} className={primary}><RotateCcw size={18} /> {t('newMatch')}</button>}
      </div>
    </div>
  )
}
