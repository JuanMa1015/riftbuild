import { MousePointerClick, PictureInPicture2, Sparkles } from 'lucide-react'
import { useT } from '../i18n'
import { bubbleSupported, setBubblePref, useBubble } from '../lib/bubble'
import { Mark } from './flow/FlowChrome'
import LangToggle from './LangToggle'

export const isOnboarded = () => {
  try {
    // anyone who already has saved app data has used it before: no intro for them
    return ['wr-onboarded', 'wr-bubble', 'wr-bubble-asked', 'wr-recent', 'wr-lang', 'wr-ai-config'].some(k => localStorage.getItem(k))
  } catch { return true }
}
const finish = () => { try { localStorage.setItem('wr-onboarded', '1') } catch { /* storage blocked */ } }

// First launch only: what the app does and why the overlay permission is requested.
export default function Onboarding({ onDone }) {
  const { t } = useT()
  const steps = [
    [MousePointerClick, t('obStep1')],
    ...(bubbleSupported ? [[PictureInPicture2, t('obStep2')]] : []),
    [Sparkles, t('obStep3')],
  ]
  async function enable() {
    finish(); setBubblePref('on'); onDone()
    await useBubble.getState().toggle()   // asks for the permission; the app switches the bubble on when you come back
  }
  function skip() { finish(); setBubblePref('off'); onDone() }
  return (
    <div className="pt-safe pb-safe fixed inset-0 z-50 flex flex-col overflow-y-auto bg-felt px-6">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
        <div className="mb-4 flex items-center justify-between"><span className="text-marker"><Mark size={40} /></span><LangToggle /></div>
        <h1 className="mb-6 text-2xl font-bold tracking-tight">{t('obTitle')}</h1>
        <ul className="mb-8 flex flex-col gap-4">
          {steps.map(([Icon, text], i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-felt-2"><Icon size={20} aria-hidden /></span>
              <p className="pt-1.5 leading-snug">{text}</p>
            </li>
          ))}
        </ul>
        {bubbleSupported ? (
          <>
            <button type="button" onClick={enable} className="mb-2 h-12 w-full rounded-xl bg-marker font-bold text-marker-ink">{t('obBubble')}</button>
            <button type="button" onClick={skip} className="h-12 w-full rounded-xl text-chalk-dim">{t('obSkip')}</button>
          </>
        ) : (
          <button type="button" onClick={() => { finish(); onDone() }} className="h-12 w-full rounded-xl bg-marker font-bold text-marker-ink">{t('obStart')}</button>
        )}
      </div>
    </div>
  )
}
