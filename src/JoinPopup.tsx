import { useEffect, useRef } from 'react'
import { ArrowRight, CalendarDays, Heart, MapPin, X } from 'lucide-react'

type Lang = 'bm' | 'en'
const copy = {
  bm: { tag: 'SELAMAT DATANG', title: 'Ada tempat untuk anda di sini.', body: 'SIB Pekan Ranau mengalu-alukan anda untuk beribadah, mengenali komuniti kami dan bertumbuh bersama.', visit: 'Langkah pertama yang mudah', visitText: 'Datang ke ibadah Ahad. Anda boleh hadir seperti seadanya dan mengenali kami selepas ibadah.', time: 'Setiap Ahad · 9:00 pagi', place: 'SIB Pekan Ranau, Sabah', schedule: 'Lihat jadual ibadah', ministries: 'Lihat pelayanan', close: 'Tutup' },
  en: { tag: 'WELCOME', title: 'There is a place for you here.', body: 'SIB Pekan Ranau welcomes you to worship, meet our community, and grow together.', visit: 'A simple first step', visitText: 'Come to Sunday service. You can arrive as you are and get to know us after worship.', time: 'Every Sunday · 9:00 AM', place: 'SIB Pekan Ranau, Sabah', schedule: 'View service schedule', ministries: 'Explore ministries', close: 'Close' }
}
export function JoinPopup({ lang, onClose, onSchedule, onMinistries }: { lang: Lang; onClose: () => void; onSchedule: () => void; onMinistries: () => void }) {
  const t = copy[lang]
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.join-dialog button'))
        const first = buttons[0], last = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown) }
  }, [onClose])
  return <div className="join-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="join-dialog" role="dialog" aria-modal="true" aria-labelledby="join-title" aria-describedby="join-description">
      <button className="join-close" ref={closeRef} onClick={onClose} aria-label={t.close}><X size={21}/></button>
      <div className="join-symbol"><Heart size={28}/></div><span className="eyebrow">{t.tag} / SIBPR</span><h2 id="join-title">{t.title}</h2><p id="join-description" className="join-body">{t.body}</p>
      <div className="join-visit"><strong>{t.visit}</strong><p>{t.visitText}</p><div><CalendarDays size={17}/>{t.time}</div><div><MapPin size={17}/>{t.place}</div></div>
      <div className="join-actions"><button className="btn btn-green" onClick={onSchedule}>{t.schedule}<ArrowRight size={17}/></button><button className="text-link" onClick={onMinistries}>{t.ministries}<ArrowRight size={17}/></button></div>
    </section>
  </div>
}
