import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin } from 'lucide-react'
import { MainpageVideo } from './MainpageVideo'

type SavedActivity = { id: string; date: string; theme: string; scripture: string; notes: string }
type Props = { lang: 'bm' | 'en'; onSchedule: (date: string) => void; onViewPage?: () => void; imageSrc?: string; videoSrc?: string }

const todayInRanau = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }))

export function EventsSection({ lang, onSchedule, onViewPage, imageSrc, videoSrc }: Props) {
  const [month, setMonth] = useState(() => new Date(todayInRanau.getFullYear(), todayInRanau.getMonth(), 1))
  const [selected, setSelected] = useState<number | null>(null)
  const [saved, setSaved] = useState<SavedActivity[]>([])
  const [loadError, setLoadError] = useState(false)
  const locale = lang === 'bm' ? 'ms-MY' : 'en-MY'
  const firstWeekday = (month.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
  useEffect(() => {
    const controller = new AbortController()
    setSaved([])
    setLoadError(false)
    fetch(`/api/services?from=${monthKey}-01&limit=52`, { signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('Could not load activities')
      return response.json() as Promise<SavedActivity[]>
    }).then(data => setSaved(data.filter(item => item.id && item.date.startsWith(monthKey)))).catch(error => {
      if (error.name !== 'AbortError') setLoadError(true)
    })
    return () => controller.abort()
  }, [monthKey])
  const activities = saved.filter(item => item.date.startsWith(monthKey)).sort((a, b) => a.date.localeCompare(b.date))
  const days = activities.map(item => Number(item.date.slice(-2)))
  const activeDay = selected && days.includes(selected) ? selected : days.find(day => month.getFullYear() === todayInRanau.getFullYear() && month.getMonth() === todayInRanau.getMonth() && day >= todayInRanau.getDate()) ?? days[0]
  const active = activities.find(item => Number(item.date.slice(-2)) === activeDay)
  const isSunday = active ? new Date(`${active.date}T12:00:00`).getDay() === 0 : false
  const formatDay = (day: number) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(month.getFullYear(), month.getMonth(), day))
  const fullDate = active ? new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${active.date}T12:00:00`)) : ''
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(month)
  const weekdays = lang === 'bm' ? ['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Aha'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const serviceName = lang === 'bm' ? 'Ibadah Ahad' : 'Sunday Service'
  const serviceTime = lang === 'bm' ? '9:00 pagi' : '9:00 AM'
  const activityName = (item: SavedActivity) => new Date(`${item.date}T12:00:00`).getDay() === 0 ? serviceName : item.theme || (lang === 'bm' ? 'Aktiviti gereja' : 'Church activity')

  function changeMonth(offset: number) {
    setMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1))
    setSelected(null)
  }

  return <section className="events-section" id="events"><div className="container">
    <div className="section-heading reveal"><div><div className="eyebrow"><span className="eyebrow-line"/>{lang === 'bm' ? 'ACARA & AKTIVITI' : 'EVENTS & ACTIVITIES'}</div><h2>{lang === 'bm' ? 'Apa yang berlaku di SIBPR.' : 'What is happening at SIBPR.'}</h2></div><div><p>{lang === 'bm' ? 'Lihat aktiviti mengikut bulan. Maklumat acara baharu akan ditambah apabila diumumkan.' : 'Browse activities by month. New events will appear when announced.'}</p>{onViewPage && <button type="button" className="text-link events-page-link" onClick={onViewPage}>{lang === 'bm' ? 'Buka halaman acara' : 'Open events page'}<ArrowRight size={17}/></button>}</div></div>
    {imageSrc && <img className="mainpage-section-image reveal" src={imageSrc} alt={lang === 'bm' ? 'Aktiviti SIBPR' : 'SIBPR activities'} loading="lazy"/>}
    <MainpageVideo src={videoSrc} className="mainpage-section-video" label={lang === 'bm' ? 'Video acara SIBPR' : 'SIBPR events video'}/>
    <div className="activities-layout">
      <div className="activities-panel reveal">
        <div className="calendar-head"><div><span className="small-label">{lang === 'bm' ? 'KALENDAR & SENARAI AKTIVITI' : 'ACTIVITY CALENDAR & LIST'}</span><h3>{monthLabel}</h3></div><div className="calendar-nav"><button type="button" onClick={() => changeMonth(-1)} aria-label={lang === 'bm' ? 'Bulan sebelumnya' : 'Previous month'}><ChevronLeft size={19}/></button><button type="button" onClick={() => changeMonth(1)} aria-label={lang === 'bm' ? 'Bulan seterusnya' : 'Next month'}><ChevronRight size={19}/></button></div></div>
        <div className="calendar-grid">{weekdays.map(day => <span className="calendar-weekday" key={day}>{day}</span>)}{Array.from({ length: firstWeekday }, (_, i) => <span key={`empty-${i}`} aria-hidden="true"/>)}{Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => { const item = activities.find(activity => Number(activity.date.slice(-2)) === day); return item ? <button type="button" key={day} className={`calendar-day event-day${activeDay === day ? ' selected' : ''}`} onClick={() => setSelected(day)} aria-label={`${formatDay(day)}: ${activityName(item)}`} aria-pressed={activeDay === day}>{day}<span className="calendar-dot"/></button> : <span className="calendar-day" key={day}>{day}</span> })}</div>
        <div className="activity-list-head"><span className="small-label">{lang === 'bm' ? 'SENARAI AKTIVITI' : 'ACTIVITY LIST'}</span><span>{activities.length} {lang === 'bm' ? 'aktiviti' : 'activities'}</span></div>
        {loadError ? <p className="activity-empty">{lang === 'bm' ? 'Aktiviti tidak dapat dimuatkan.' : 'Activities could not be loaded.'}</p> : activities.length ? <div className="activities-table-wrap"><table className="activities-table"><thead><tr><th>{lang === 'bm' ? 'Tarikh' : 'Date'}</th><th>{lang === 'bm' ? 'Aktiviti' : 'Activity'}</th><th>{lang === 'bm' ? 'Masa' : 'Time'}</th></tr></thead><tbody>{activities.map(item => { const day = Number(item.date.slice(-2)); const sunday = new Date(`${item.date}T12:00:00`).getDay() === 0; return <tr key={item.date} className={activeDay === day ? 'selected' : ''}><td><button type="button" onClick={() => setSelected(day)} aria-label={`${lang === 'bm' ? 'Pilih' : 'Select'} ${formatDay(day)}`}>{formatDay(day)}</button></td><td>{activityName(item)}</td><td>{sunday ? serviceTime : '—'}</td></tr> })}</tbody></table></div> : <p className="activity-empty">{lang === 'bm' ? 'Tiada aktiviti disimpan untuk bulan ini.' : 'No saved activities for this month.'}</p>}
      </div>
      <aside className="activity-overview reveal" aria-label={lang === 'bm' ? 'Maklumat aktiviti' : 'Activity information'}>
        <span className="small-label">{lang === 'bm' ? 'MAKLUMAT AKTIVITI' : 'ACTIVITY INFORMATION'}</span>
        <div className="activity-overview-icon"><CalendarDays size={26}/></div>
        {active ? <><p className="activity-overview-date">{fullDate}</p><h3>{activityName(active)}</h3>{active.theme && isSunday && <p className="activity-overview-intro">{active.theme}</p>}{active.scripture && <p className="activity-overview-intro">{active.scripture}</p>}{active.notes && <p className="activity-overview-intro">{active.notes}</p>}{isSunday && <div className="activity-overview-facts"><div><Clock3 size={19}/><span><small>{lang === 'bm' ? 'MASA' : 'TIME'}</small><strong>{serviceTime}</strong></span></div><div><MapPin size={19}/><span><small>{lang === 'bm' ? 'LOKASI' : 'LOCATION'}</small><strong>SIB Pekan Ranau, Sabah</strong></span></div></div>}<button type="button" className="text-link calendar-schedule-link" onClick={() => onSchedule(active.date)}>{lang === 'bm' ? 'Lihat jadual pelayanan' : 'View service schedule'}<ArrowRight size={17}/></button></> : <p className="activity-empty">{lang === 'bm' ? 'Pilih bulan yang mempunyai aktiviti tersimpan.' : 'Choose a month with saved activities.'}</p>}
      </aside>
    </div>
  </div></section>
}
