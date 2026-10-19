import { useState, useEffect } from 'react'
import { Capacitor, registerPlugin } from '@capacitor/core'
import { useMatchStore } from '../../store'
import { useT } from '../../i18n'

const Overlay = registerPlugin('Overlay')

function summary(r, t) {
  return [
    `${r.campeon} · ${r.carril}`,
    ...r.build.map((b, i) => `${i + 1}. ${b.nombre}`),
    `${t('bootsLbl')}: ${r.botas?.nombre}`,
    `${t('runeLbl')}: ${r.runas?.[0]?.n}`,
    `${t('spellsLbl')}: ${r.hechizos?.join(', ')}`,
  ].join('\n')
}

// Only renders inside the Android app; the floating bubble shows the current build over the game.
export default function OverlayToggle() {
  const { t } = useT()
  const result = useMatchStore(s => s.result)
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (on && result) Overlay.show({ text: summary(result, t) }).catch(() => {})
  }, [on, result])

  if (!Capacitor.isNativePlatform()) return null

  async function toggle() {
    if (on) { await Overlay.hide(); return setOn(false) }
    const { granted } = await Overlay.canDraw()
    if (!granted) return Overlay.requestPermission() // user flips the switch, then taps again
    setOn(true)
  }

  return (
    <button type="button" onClick={toggle}
      className={`w-full mb-3.5 py-3 font-extrabold text-[13px] rounded-[10px] border
        ${on ? 'bg-[var(--gold)] text-black border-[var(--gold)]' : 'bg-[var(--bg3)] text-[var(--text)] border-[var(--border2)]'}`}>
      {on ? t('bubbleOn') : t('bubbleOff')}
    </button>
  )
}
