import { Languages } from 'lucide-react'
import { useT, useLang } from '../i18n'

// Two labelled halves, the active one lit: it reads as "this app speaks ES / EN" and one tap switches.
export default function LangToggle() {
  const { t } = useT()
  const { lang, setLang } = useLang()
  return (
    <div role="radiogroup" aria-label={t('language')} className="flex items-center gap-1 rounded-full border border-line bg-felt-2 p-0.5">
      <Languages size={16} aria-hidden className="ml-2 text-chalk-dim" />
      {[['es', 'ES', 'Español'], ['en', 'EN', 'English']].map(([k, short, full]) => (
        <button key={k} type="button" role="radio" aria-checked={lang === k} aria-label={full} title={full} onClick={() => setLang(k)}
          className={`h-8 min-w-9 rounded-full px-2 text-sm font-bold ${lang === k ? 'bg-marker text-marker-ink' : 'text-chalk-dim'}`}>{short}</button>
      ))}
    </div>
  )
}
