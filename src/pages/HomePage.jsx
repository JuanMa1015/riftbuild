import { useEffect, useState } from 'react'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useMatchStore } from '../store'
import { checkForUpdates } from '../lib/updater'
import { useBuild } from '../lib/useBuild'
import { useMedia } from '../lib/useMedia'
import { BubbleSync } from '../lib/bubble'
import { TopBar, Stepper, Dock, StepHeading, NewMatchButton } from '../components/flow/FlowChrome'
import { useT } from '../i18n'
import { LANES } from '../data/champions'
import StepMe from '../components/flow/StepMe'
import StepFoes from '../components/flow/StepFoes'
import BuildView from '../components/build/BuildView'
import SettingsPage from './SettingsPage'
import Onboarding, { isOnboarded } from '../components/Onboarding'
import ConsentPrompt from '../components/ConsentPrompt'
import { track } from '../lib/analytics'

export default function HomePage() {
  const { step, setStep, view, myChamp, enemies } = useMatchStore()
  const { t } = useT()
  const wide = useMedia('(min-width: 768px)')   // window / tablet mode: inputs left, build right
  const xl = useMedia('(min-width: 1280px)')   // desktop / big tablet: one column per step
  const build = useBuild()
  const [onb, setOnb] = useState(() => !isOnboarded())

  useEffect(() => { checkForUpdates(); track('open') }, [])

  // Android back button walks the flow backwards before leaving the app
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const h = CapApp.addListener('backButton', () => {
      const s = useMatchStore.getState()
      if (s.view === 'settings') s.setView('flow')
      else if (s.step > 0) s.setStep(s.step - 1)
      else CapApp.exitApp()
    })
    return () => { h.then(x => x.remove()) }
  }, [])

  const buildView = <BuildView {...build} />

  let body
  if (view === 'settings') {
    body = <div className="min-h-0 flex-1 overflow-y-auto"><SettingsPage /></div>
  } else if (wide) {
    const hasFoes = LANES.some(l => enemies[l.id])
    const h1 = <StepHeading n={1} title={t('meTitle')} done={!!myChamp} action={myChamp && <NewMatchButton />} />
    const h2 = <StepHeading n={2} title={t('stepFoesFull')} done={hasFoes} />
    const h3 = <StepHeading n={3} title={t('stepBuildFull')} locked={!myChamp} />
    const col = 'flex min-h-0 flex-col'
    const scroll = 'min-h-0 flex-1 overflow-y-auto pb-8 pr-1'
    body = xl ? (
      <div className="mx-auto grid min-h-0 w-full max-w-[1500px] flex-1 grid-cols-[330px_370px_minmax(0,1fr)] gap-6 px-6">
        <div className={col}>{h1}<div className={scroll}><StepMe compact hideTitle roomy /></div></div>
        <div className={col}>{h2}<div className={scroll}><StepFoes /></div></div>
        <div className={col}>{h3}<div className={scroll}>{buildView}</div></div>
      </div>
    ) : (
      <div className="mx-auto grid min-h-0 w-full max-w-[1500px] flex-1 grid-cols-[minmax(340px,420px)_minmax(0,1fr)] gap-8 px-6">
        <div className={`${scroll} pt-0`}>
          {h1}<StepMe compact hideTitle />
          <div className="mt-8">{h2}<StepFoes /></div>
        </div>
        <div className={col}>{h3}<div className={scroll}>{buildView}</div></div>
      </div>
    )
  } else {
    body = (
      <>
        <Stepper />
        <main key={step} className="slide-in min-h-0 flex-1 overflow-y-auto px-4 pb-6">
          <div className="mx-auto max-w-xl">
            {step === 0 && <StepMe onPicked={() => setStep(1)} />}
            {step === 1 && <StepFoes />}
            {step === 2 && buildView}
          </div>
        </main>
        <Dock />
      </>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-felt text-chalk">
      <BubbleSync />
      {onb && <Onboarding onDone={() => setOnb(false)} />}
      {!onb && <ConsentPrompt />}
      {view === 'flow' ? <TopBar /> : <div className="pt-safe" />}
      {body}
    </div>
  )
}
