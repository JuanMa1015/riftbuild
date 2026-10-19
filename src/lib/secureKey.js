import { Capacitor, registerPlugin } from '@capacitor/core'

// The AI key lives in the Android Keystore (AES-256-GCM, see SecureStorePlugin.java), never in localStorage.
// In a plain browser (development) there is no Keystore: it falls back to localStorage under its own name.
const Native = Capacitor.isNativePlatform() ? registerPlugin('SecureStore') : null
const NAME = 'ai-key'
const WEB = 'wr-ai-key'

export const secureAvailable = !!Native

export async function loadKey() {
  if (Native) return (await Native.get({ name: NAME })).value || ''
  try { return localStorage.getItem(WEB) || '' } catch { return '' }
}

export async function saveKey(value) {
  if (Native) return value ? Native.set({ name: NAME, value }) : Native.remove({ name: NAME })
  try { if (value) localStorage.setItem(WEB, value); else localStorage.removeItem(WEB) } catch { /* storage blocked */ }
}

// Older versions kept the key inside the persisted settings in localStorage. Move it to secure storage, and only
// wipe the old copy once the new one is saved.
export async function migrateLegacyKey() {
  try {
    const raw = localStorage.getItem('wr-ai-config')
    const parsed = raw && JSON.parse(raw)
    const legacy = parsed?.state?.key
    if (!legacy) return ''
    await saveKey(legacy)
    delete parsed.state.key
    localStorage.setItem('wr-ai-config', JSON.stringify(parsed))
    return legacy
  } catch { return '' }
}
