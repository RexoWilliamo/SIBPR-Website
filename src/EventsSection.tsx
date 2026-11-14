import { useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Clock3, MapPin } from 'lucide-react'

type Props = { lang: 'bm' | 'en'; onSchedule: () => void; onViewPage?: () => void }

const todayInRanau = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }))

export function EventsSection({ lang, onSchedule, onViewPage }: Props) {
  const [month, setMonth] = useState(() => new Date(todayInRanau.getFullYear(), todayInRanau.getMonth(), 1))
  const [selected, setSelected] = useState<number | null>(null)
  const locale = lang === 'bm' ? 'ms-MY' : 'en-MY'
  const firstWeekday = (month.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const sundays = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(day => new Date(month.getFullYear(), month.getMonth(), day).getDay() === 0)
  const activeDay = selected && sundays.includes(selected) ? selected : sundays.find(day => month.getFullYear() === todayInRanau.getFullYear() && month.getMonth() === todayInRanau.getMonth() && day >= todayInRanau.getDate()) ?? sundays[0]
  const formatDay = (day: number) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(month.getFullYear(), month.getMonth(), day))
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(month)
  const weekdays = lang === 'bm' ? ['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Aha'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  function changeMonth(offset: number) {
    setMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1))
    setSelected(null)
  }

  return <section className="events-section" id="events"><div className="container">
    <div className="section-heading reveal"><div><div className="eyebrow"><span className="eyebrow-line"/>{lang === 'bm' ? 'ACARA & AKTIVITI' : 'EVENTS & ACTIVITIES'}</div><h2>{lang === 'bm' ? 'Apa yang berlaku di SIBPR.' : 'What is happening at SIBPR.'}</h2></div><div><p>{lang === 'bm' ? 'Lihat aktiviti mengikut bulan. Maklumat acara baharu akan ditambah apabila diumumkan.' : 'Browse activities by month. New events will appear when announced.'}</p>{onViewPage && <button type="button" className="text-link events-page-link" onClick={onViewPage}>{lang === 'bm' ? 'Buka halaman acara' : 'Open events page'}<ArrowRight size={17}/></button>}</div></div>
    <div className="activities-layout">
      <div className="activities-panel reveal"><div className="activities-panel-head"><span className="small-label">{lang === 'bm' ? 'SENARAI AKTIVITI' : 'ACTIVITY LIST'}</span><h3>{monthLabel}</h3></div><div className="activities-table-wrap"><table className="activities-table"><thead><tr><th>{lang === 'bm' ? 'Tarikh' : 'Date'}</th><th>{lang === 'bm' ? 'Aktiviti' : 'Activity'}</th><th>{lang === 'bm' ? 'Masa' : 'Time'}</th></tr></thead><tbody>{sundays.map(day => <tr key={day} className={activeDay === day ? 'selected' : ''}><td><button type="button" onClick={() => setSelected(day)} aria-label={`${lang === 'bm' ? 'Pilih' : 'Select'} ${formatDay(day)}`}>{formatDay(day)}</button></td><td>{lang === 'bm' ? 'Ibadah Ahad' : 'Sunday Service'}</td><td>9:00 {lang === 'bm' ? 'pagi' : 'AM'}</td></tr>)}</tbody></table></div><div className="activities-panel-foot"><MapPin size={17}/><span>SIB Pekan Ranau, Sabah</span></div></div>
      <div className="calendar-panel reveal"><div className="calendar-head"><div><span className="small-label">{lang === 'bm' ? 'KALENDAR AKTIVITI' : 'ACTIVITY CALENDAR'}</span><h3>{monthLabel}</h3></div><div className="calendar-nav"><button type="button" onClick={() => changeMonth(-1)} aria-label={lang === 'bm' ? 'Bulan sebelumnya' : 'Previous month'}><ChevronLeft size={19}/></button><button type="button" onClick={() => changeMonth(1)} aria-label={lang === 'bm' ? 'Bulan seterusnya' : 'Next month'}><ChevronRight size={19}/></button></div></div><div className="calendar-grid">{weekdays.map(day => <span className="calendar-weekday" key={day}>{day}</span>)}{Array.from({ length: firstWeekday }, (_, i) => <span key={`empty-${i}`} aria-hidden="true"/>)}{Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => sundays.includes(day) ? <button type="button" key={day} className={`calendar-day event-day${activeDay === day ? ' selected' : ''}`} onClick={() => setSelected(day)} aria-label={`${formatDay(day)}: ${lang === 'bm' ? 'Ibadah Ahad, 9:00 pagi' : 'Sunday Service, 9:00 AM'}`} aria-pressed={activeDay === day}>{day}<span className="calendar-dot"/></button> : <span className="calendar-day" key={day}>{day}</span>)}</div><div className="calendar-detail"><span className="calendar-detail-icon"><Clock3 size={19}/></span><div><strong>{formatDay(activeDay)} · {lang === 'bm' ? 'Ibadah Ahad' : 'Sunday Service'}</strong><p>9:00 {lang === 'bm' ? 'pagi' : 'AM'} · SIB Pekan Ranau, Sabah</p></div></div><button type="button" className="text-link calendar-schedule-link" onClick={onSchedule}>{lang === 'bm' ? 'Lihat jadual pelayanan' : 'View service schedule'}<ArrowRight size={17}/></button></div>
    </div>
  </div></section>
}
