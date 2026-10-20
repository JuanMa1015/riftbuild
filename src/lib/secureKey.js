import { Capacitor, registerPlugin } from '@capacitor/core'

// The AI key lives in the Android Keystore (AES-256-GCM, see SecureStorePlugin.java), never in localStorage.
// In a plain browser (development) there is no Keystore: it falls back to localStorage under its own name.
const Native = Capacitor.isNativePlatform() ? registerPlugin('SecureStore') : null
const NAME = 'ai-key'

export const secureAvailable = !!Native

// name: which secret. The browser fallback stores it as wr-<name>.
export async function loadKey(name = NAME) {
  if (Native) return (await Native.get({ name })).value || ''
  try { return localStorage.getItem('wr-' + name) || '' } catch { return '' }
}

export async function saveKey(value, name = NAME) {
  if (Native) return value ? Native.set({ name, value }) : Native.remove({ name })
  try { if (value) localStorage.setItem('wr-' + name, value); else localStorage.removeItem('wr-' + name) } catch { /* storage blocked */ }
}

// every provider's key, as one JSON object in a single secret
export const loadKeys = () => loadKey('ai-keys')
export const saveKeys = (obj) => saveKey(Object.keys(obj).length ? JSON.stringify(obj) : '', 'ai-keys')

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
