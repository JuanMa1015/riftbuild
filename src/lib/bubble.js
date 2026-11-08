import { useEffect } from 'react'
import { create } from 'zustand'
import { Capacitor, registerPlugin } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { useMatchStore, useTimerStore } from '../store'
import { useT } from '../i18n'
import { GAME } from '../data/game'

// Floating bubble over the game (Android only; native code lives in android/.../OverlayService.java)
export const Overlay = registerPlugin('Overlay')
export const bubbleSupported = Capacitor.isNativePlatform()

// The bubble is on by default; the user's explicit "off" (toggle or the bubble's own X) is remembered.
const store = (k, v) => { try { localStorage.setItem(k, v) } catch { /* storage blocked */ } }
const stored = k => { try { return localStorage.getItem(k) } catch { return null } }
const wantsBubble = () => stored('wr-bubble') !== 'off'

export const useBubble = create((set, get) => ({
  on: false,
  notif: true,   // false = Android hides our notification, which is the way back after closing the bubble
  async checkNotif() { try { set({ notif: (await Overlay.notifState()).enabled }) } catch { /* not native */ } },
  async toggle() {
    if (get().on) { await Overlay.hide(); store('wr-bubble', 'off'); return set({ on: false }) }
    store('wr-bubble', 'on')
    const { granted } = await Overlay.canDraw()
    if (granted) {
      set({ on: true })
      await askNotifications()
    }
    else await Overlay.requestPermission()   // on return, the resume handler below switches it on
  },
}))

// Android 13+ keeps the notification hidden until the user allows it: ask once, explain in Settings afterwards.
async function askNotifications() {
  const s = useBubble.getState()
  await s.checkNotif()
  if (!useBubble.getState().notif && !stored('wr-notif-asked')) {
    store('wr-notif-asked', '1')
    try { useBubble.setState({ notif: (await Overlay.requestNotifications()).enabled }) } catch { /* not native */ }
  }
}

// Resume an opted-in bubble after returning from Android's permission screen.
async function autoEnable() {
  if (!bubbleSupported || !wantsBubble() || useBubble.getState().on) return
  if (stored('wr-onboarded') !== '1' && !stored('wr-bubble')) return
  const { granted } = await Overlay.canDraw()
  if (granted) {
    useBubble.setState({ on: true })
    askNotifications()
    return
  }
}

// What the native bubble draws: icons come from the bundled assets by slug, text from here.
const slug = n => n.toLowerCase().replace(/[^a-z0-9]/g, '')

function payload(r, t, lang, secs) {
  const rune = r.runas?.[0]
  return JSON.stringify({
    timers: GAME.timers.map(tm => ({ id: tm.id, n: lang === 'en' ? tm.en : tm.es, secs: secs[tm.id] ?? tm.secs })),
    title: `${r.campeon} · ${t('role.' + r.carril) !== 'role.' + r.carril ? t('role.' + r.carril) : r.carril}`,
    champ: { n: r.campeon, i: slug(r.campeon) },
    items: r.build.map(b => ({ n: b.nombre, i: b.en })),
    boots: r.botas ? { n: r.botas.nombre, i: r.botas.en } : null,
    rune: rune ? { n: rune.n, i: slug(GAME.en[rune.n] ?? rune.n) } : null,
    spells: (r.hechizos || []).map(h => ({ n: h, i: slug(h) })),
    foot: `${r.runas?.[0]?.n} · ${r.hechizos?.join(' / ')}`,
    open: t('openApp'),
    close: t('close'),
    notif: t('bubbleNotif'),
  })
}

// Showing and hiding the bubble as the app comes and goes is native (MainActivity). Here: back from the permission screens.
if (bubbleSupported) {
  CapApp.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) return
    autoEnable()
    useBubble.getState().checkNotif()
  })
}

// Mount once: keeps the bubble text in sync with the current build and language.
export function BubbleSync() {
  const { t, lang } = useT()
  const result = useMatchStore(s => s.result)
  const myChamp = useMatchStore(s => s.myChamp)
  const on = useBubble(s => s.on)
  const secs = useTimerStore(s => s.secs)
  useEffect(() => { autoEnable() }, [])
  useEffect(() => {
    if (!bubbleSupported) return
    if (!myChamp) Overlay.clearBuild().catch(() => {})
    else if (on && result?.campeon === myChamp.n) Overlay.show({ data: payload(result, t, lang, secs) }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, result, myChamp, lang, secs])
  return null
}

// The overlay's own X (or its notification action) closes it natively: mirror that in the toggle.
if (bubbleSupported) Overlay.addListener('closed', () => { store('wr-bubble', 'off'); useBubble.setState({ on: false }) })
