import { useEffect } from 'react'
import { create } from 'zustand'
import { Capacitor, registerPlugin } from '@capacitor/core'
import { useMatchStore } from '../store'
import { useT } from '../i18n'

// Floating bubble over the game (Android only; native code lives in android/.../OverlayService.java)
const Overlay = registerPlugin('Overlay')
export const bubbleSupported = Capacitor.isNativePlatform()

export const useBubble = create((set, get) => ({
  on: false,
  async toggle() {
    if (get().on) { await Overlay.hide(); return set({ on: false }) }
    const { granted } = await Overlay.canDraw()
    if (!granted) return Overlay.requestPermission() // the user flips the switch in Settings, then taps again
    set({ on: true })
  },
}))

// What the native bubble draws: icons come from the bundled assets by slug, text from here.
function payload(r, t) {
  return JSON.stringify({
    title: `${r.campeon} · ${t('role.' + r.carril) !== 'role.' + r.carril ? t('role.' + r.carril) : r.carril}`,
    items: r.build.map(b => ({ n: b.nombre, i: b.en })),
    boots: r.botas ? { n: r.botas.nombre, i: r.botas.en } : null,
    foot: `${r.runas?.[0]?.n} · ${r.hechizos?.join(' / ')}`,
    open: t('openApp'),
    close: t('close'),
  })
}

// Mount once: keeps the bubble text in sync with the current build and language.
export function BubbleSync() {
  const { t, lang } = useT()
  const result = useMatchStore(s => s.result)
  const on = useBubble(s => s.on)
  useEffect(() => {
    if (on && result) Overlay.show({ data: payload(result, t) }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, result, lang])
  return null
}

// The overlay's own X (or its notification action) closes it natively: mirror that in the toggle.
if (bubbleSupported) Overlay.addListener('closed', () => useBubble.setState({ on: false }))
