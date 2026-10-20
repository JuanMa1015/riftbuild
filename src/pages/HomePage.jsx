import { useEffect, useState } from 'react'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useMatchStore } from '../store'
import { checkForUpdates } from '../lib/updater'
import { useBuild } from '../lib/useBuild'
import { useMedia } from '../lib/useMedia'
import { BubbleSync } from '../lib/bubble'
import { TopBar, Stepper, Dock } from '../components/flow/FlowChrome'
import StepMe from '../components/flow/StepMe'
import StepFoes from '../components/flow/StepFoes'
import BuildView from '../components/build/BuildView'
import SettingsPage from './SettingsPage'
import Onboarding, { isOnboarded } from '../components/Onboarding'
import ConsentPrompt from '../components/ConsentPrompt'
import { track } from '../lib/analytics'

export default function HomePage() {
  const { step, setStep, view } = useMatchStore()
  const wide = useMedia('(min-width: 768px)')   // window / tablet mode: inputs left, build right
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
    body = (
      <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 grid-cols-[minmax(340px,420px)_1fr] gap-8 px-6">
        <div className="min-h-0 overflow-y-auto pb-8 pr-1">
          <StepMe compact />
          <div className="mt-8"><StepFoes /></div>
        </div>
        <div className="min-h-0 overflow-y-auto pb-8">{buildView}</div>
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
