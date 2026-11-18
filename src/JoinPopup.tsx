import { useCallback, useEffect, useRef, useState } from 'react'
import { Heart, X } from 'lucide-react'

type Lang = 'bm' | 'en'
const copy = {
  bm: { tag: 'KENALI KELUARGA SIBPR', title: 'Selamat datang. Ada tempat untuk anda di sini.', body: 'Sama ada ini kali pertama anda datang atau anda sedang mencari komuniti rohani, kami gembira dapat menyambut anda. Datanglah seperti seadanya dan kenali kami langkah demi langkah.', history: 'Sejarah ringkas', historyText: 'SIB Pekan Ranau ialah komuniti gereja di Ranau, Sabah. Kisah komuniti ini terus berkembang melalui ibadah, persekutuan dan pelayanan bersama masyarakat setempat.', mission: 'Misi', missionText: 'Beribadah kepada Tuhan, bertumbuh dalam iman dan melayani sesama dengan kasih.', vision: 'Visi', visionText: 'Menjadi keluarga gereja yang menyambut semua orang dan bertumbuh bersama dalam Kristus.', close: 'Tutup' },
  en: { tag: 'MEET THE SIBPR FAMILY', title: 'Welcome. There is a place for you here.', body: 'Whether this is your first visit or you are looking for a church community, we are glad to welcome you. Come as you are and get to know us at your own pace.', history: 'Brief history', historyText: 'SIB Pekan Ranau is a church community in Ranau, Sabah. Its story continues through worship, fellowship, and serving the local community.', mission: 'Mission', missionText: 'To worship God, grow in faith, and serve others with love.', vision: 'Vision', visionText: 'To be a welcoming church family that grows together in Christ.', close: 'Close' }
}
export function JoinPopup({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const t = copy[lang]
  const closeRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<number | null>(null)
  const [closing, setClosing] = useState(false)
  const requestClose = useCallback(() => {
    if (closeTimer.current !== null) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { onClose(); return }
    setClosing(true)
    closeTimer.current = window.setTimeout(onClose, 260)
  }, [onClose])
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
      if (event.key === 'Tab') {
        const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.join-dialog button'))
        const first = buttons[0], last = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); if (closeTimer.current !== null) window.clearTimeout(closeTimer.current) }
  }, [requestClose])
  return <div className={closing ? 'join-backdrop closing' : 'join-backdrop'} onMouseDown={event => { if (event.target === event.currentTarget) requestClose() }}>
    <section className="join-dialog" role="dialog" aria-modal="true" aria-labelledby="join-title" aria-describedby="join-description">
      <button className="join-close" ref={closeRef} onClick={requestClose} aria-label={t.close}><X size={21}/></button>
      <div className="join-intro"><div className="join-symbol"><Heart size={28}/></div><span className="eyebrow">{t.tag}</span><h2 id="join-title">{t.title}</h2><p id="join-description" className="join-body">{t.body}</p></div>
      <div className="join-story"><article><span>01</span><h3>{t.history}</h3><p>{t.historyText}</p></article><article><span>02</span><h3>{t.mission}</h3><p>{t.missionText}</p></article><article><span>03</span><h3>{t.vision}</h3><p>{t.visionText}</p></article></div>
    </section>
  </div>
}
