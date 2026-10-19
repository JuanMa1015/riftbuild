import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GC_CODE } from './analyticsConfig'

// Anonymous usage counts, strictly opt-in. Off until the user says yes; never sends champions, builds, keys or any text.
export const analyticsAvailable = !!GC_CODE

export const useConsent = create(
  persist((set) => ({ analytics: null, set: (v) => set({ analytics: v }) }), { name: 'wr-consent' })
)

// name: a fixed event label such as 'open' or 'build-ai'
export function track(name) {
  if (!analyticsAvailable || useConsent.getState().analytics !== true) return
  const q = new URLSearchParams({ p: `app/${name}`, t: name, s: `${screen.width}x${screen.height}` })
  fetch(`https://${GC_CODE}.goatcounter.com/count?${q}`, { mode: 'no-cors', credentials: 'omit', keepalive: true }).catch(() => {})
}
