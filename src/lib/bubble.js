import { useEffect } from 'react'
import { create } from 'zustand'
import { Capacitor, registerPlugin } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { useMatchStore, useTimerStore } from '../store'
import { useT } from '../i18n'
import { GAME } from '../data/game'

// Floating bubble over the game (Android only; native code lives in android/.../OverlayService.java)
const Overlay = registerPlugin('Overlay')
export const bubbleSupported = Capacitor.isNativePlatform()

// The bubble is on by default; the user's explicit "off" (toggle or the bubble's own X) is remembered.
const store = (k, v) => { try { v === undefined ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch { /* storage blocked */ } }
const stored = k => { try { return localStorage.getItem(k) } catch { return null } }
const wantsBubble = () => stored('wr-bubble') !== 'off'
export const setBubblePref = v => store('wr-bubble', v)

export const useBubble = create((set, get) => ({
  on: false,
  async toggle() {
    if (get().on) { await Overlay.hide(); store('wr-bubble', 'off'); return set({ on: false }) }
    store('wr-bubble', 'on')
    const { granted } = await Overlay.canDraw()
    if (granted) set({ on: true })
    else await Overlay.requestPermission()   // on return, the resume handler below switches it on
  },
}))

// Turn it on when the preference says so and the permission is there. Asks for the permission once, at first launch.
async function autoEnable() {
  if (!bubbleSupported || !wantsBubble() || useBubble.getState().on) return
  if (stored('wr-onboarded') !== '1' && !stored('wr-bubble')) return   // first launch: the onboarding explains the permission first
  const { granted } = await Overlay.canDraw()
  if (granted) return useBubble.setState({ on: true })
  if (!stored('wr-bubble-asked')) { store('wr-bubble-asked', '1'); Overlay.requestPermission() }
}

// What the native bubble draws: icons come from the bundled assets by slug, text from here.
const slug = n => n.toLowerCase().replace(/[^a-z0-9]/g, '')

function payload(r, t, lang, secs) {
  const rune = r.runas?.[0]
  return JSON.stringify({
    timers: GAME.timers.map(tm => ({ id: tm.id, n: lang === 'en' ? tm.en : tm.es, secs: secs[tm.id] ?? tm.secs })),
    title: `${r.campeon} · ${t('role.' + r.carril) !== 'role.' + r.carril ? t('role.' + r.carril) : r.carril}`,
    items: r.build.map(b => ({ n: b.nombre, i: b.en })),
    boots: r.botas ? { n: r.botas.nombre, i: r.botas.en } : null,
    rune: rune ? { n: rune.n, i: slug(GAME.en[rune.n] ?? rune.n) } : null,
    spells: (r.hechizos || []).map(h => ({ n: h, i: slug(h) })),
    foot: `${r.runas?.[0]?.n} · ${r.hechizos?.join(' / ')}`,
    open: t('openApp'),
    close: t('close'),
  })
}

// The bubble only shows when the app is not on screen (you are in the game).
let appActive = true
const syncHidden = () => Overlay.setHidden({ hidden: appActive }).catch(() => {})
if (bubbleSupported) {
  CapApp.addListener('appStateChange', ({ isActive }) => {
    appActive = isActive
    if (isActive) autoEnable()   // back from the permission screen
    if (useBubble.getState().on) syncHidden()
  })
}

// Mount once: keeps the bubble text in sync with the current build and language.
export function BubbleSync() {
  const { t, lang } = useT()
  const result = useMatchStore(s => s.result)
  const on = useBubble(s => s.on)
  const secs = useTimerStore(s => s.secs)
  useEffect(() => { autoEnable() }, [])
  useEffect(() => {
    if (on && result) Overlay.show({ data: payload(result, t, lang, secs) }).then(syncHidden).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, result, lang, secs])
  return null
}

// The overlay's own X (or its notification action) closes it natively: mirror that in the toggle.
if (bubbleSupported) Overlay.addListener('closed', () => { store('wr-bubble', 'off'); useBubble.setState({ on: false }) })
