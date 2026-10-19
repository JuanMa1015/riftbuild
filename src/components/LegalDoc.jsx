import { ArrowLeft } from 'lucide-react'
import { useT } from '../i18n'
import { LEGAL, UPDATED, CONTACT } from '../i18n/legal'

// Privacy policy / terms, read offline from the same text that feeds docs/*.html
export default function LegalDoc({ doc, onBack }) {
  const { t, lang } = useT()
  const L = LEGAL[lang], d = L[doc]
  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-10">
      <div className="mb-4 flex items-center gap-2">
        <button type="button" onClick={onBack} aria-label={t('back')}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-felt-2"><ArrowLeft size={22} /></button>
        <h1 className="text-xl font-semibold">{d.title}</h1>
      </div>
      <p className="mb-4 text-sm text-chalk-dim">{L.updated}: {UPDATED}</p>
      {d.sections.map(([h, p]) => (
        <section key={h} className="mb-5">
          <h2 className="mb-1 font-semibold text-marker">{h}</h2>
          <p className="leading-relaxed">{p}</p>
        </section>
      ))}
      <p className="text-sm text-chalk-dim">{t('contact')}: <a href={CONTACT} target="_blank" rel="noreferrer" className="text-marker underline">{CONTACT}</a></p>
    </div>
  )
}
