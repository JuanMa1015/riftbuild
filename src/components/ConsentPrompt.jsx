import { useT } from '../i18n'
import { analyticsAvailable, useConsent } from '../lib/analytics'

// One-time, optional: nothing is sent until the user taps Accept. Hidden when analytics is not configured.
export default function ConsentPrompt() {
  const { t } = useT()
  const { analytics, set } = useConsent()
  if (!analyticsAvailable || analytics !== null) return null
  return (
    <div role="dialog" aria-label={t('statsTitle')} className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-felt-2 px-4 py-4">
      <div className="mx-auto max-w-xl">
        <p className="font-semibold">{t('statsTitle')}</p>
        <p className="mb-3 text-sm text-chalk-dim">{t('statsBody')}</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => set(false)} className="h-11 rounded-xl border border-line font-semibold">{t('statsNo')}</button>
          <button type="button" onClick={() => set(true)} className="h-11 rounded-xl bg-marker font-bold text-marker-ink">{t('statsYes')}</button>
        </div>
      </div>
    </div>
  )
}
