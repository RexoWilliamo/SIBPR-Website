import { useEffect, useState, type FormEvent } from 'react'
import { CalendarDays, LogOut, Plus, Trash2, Users } from 'lucide-react'
import { SundayRosterEditor, type Selection } from './SundayRosterEditor'

type Lang = 'bm' | 'en'
type Teams = { praise: string[]; ushers: string[]; leaders: string[]; multimedia: string[] }
type Service = { id: string | null; date: string; theme: string; scripture: string; notes: string; teams: Teams; selection?: Selection | null }
type Role = 'admin' | 'staff' | 'service_admin'
const emptyTeams = (): Teams => ({ praise: [], ushers: [], leaders: [], multimedia: [] })
const blank = (date: string): Service => ({ id: null, date, theme: '', scripture: '', notes: '', teams: emptyTeams() })
function nextSunday() { const now = new Date(); const d = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' })); d.setDate(d.getDate() + (7 - d.getDay()) % 7); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
function isSunday(date: string) { return /^\d{4}-\d{2}-\d{2}$/.test(date) && new Date(`${date}T12:00:00Z`).getUTCDay() === 0 }
const labels = {
  en: { title: 'SIBPR Management', subtitle: 'Manage Sunday service schedules and serving teams.', login: 'Staff sign in', username: 'Username or email', password: 'Password', signIn: 'Sign in', logout: 'Sign out', list: 'Saved schedules', empty: 'No schedules saved yet.', create: 'New Sunday schedule', date: 'Sunday date', invalidDate: 'Choose a Sunday date.', theme: 'Service theme', scripture: 'Scripture', notes: 'Notes', praise: 'Praise & worship', ushers: 'Ushers', leaders: 'Worship leaders & singers', multimedia: 'Multimedia & PA System', names: 'One name per line', save: 'Save schedule', saving: 'Saving…', delete: 'Delete schedule', confirmDelete: 'Delete this Sunday schedule? This cannot be undone.', saved: 'Schedule saved. The public page now shows the update.', deleted: 'Schedule deleted. The public page now shows no assignment for this date.', staff: 'Create staff account', staffUsername: 'Staff username', staffEmail: 'Staff email', staffPassword: 'Temporary password (12+ characters)', createStaff: 'Create account', staffCreated: 'Staff account created.', noServer: 'Could not connect to the server.', sessionExpired: 'Your session expired. Please sign in again.' },
  bm: { title: 'Pengurusan SIBPR', subtitle: 'Urus jadual ibadah Ahad dan pasukan pelayanan.', login: 'Log masuk staf', username: 'Nama pengguna atau e-mel', password: 'Kata laluan', signIn: 'Log masuk', logout: 'Log keluar', list: 'Jadual tersimpan', empty: 'Belum ada jadual tersimpan.', create: 'Jadual Ahad baharu', date: 'Tarikh Ahad', invalidDate: 'Pilih tarikh hari Ahad.', theme: 'Tema ibadah', scripture: 'Bacaan Firman', notes: 'Catatan', praise: 'Pujian & penyembahan', ushers: 'Penyambut tetamu', leaders: 'Pemimpin & penyanyi', multimedia: 'Multimedia & PA System', names: 'Satu nama setiap baris', save: 'Simpan jadual', saving: 'Menyimpan…', delete: 'Padam jadual', confirmDelete: 'Padam jadual Ahad ini? Tindakan ini tidak boleh dibatalkan.', saved: 'Jadual disimpan. Halaman awam kini memaparkan kemas kini.', deleted: 'Jadual dipadam. Halaman awam kini tiada tugasan untuk tarikh ini.', staff: 'Cipta akaun staf', staffUsername: 'Nama pengguna staf', staffEmail: 'E-mel staf', staffPassword: 'Kata laluan sementara (12+ aksara)', createStaff: 'Cipta akaun', staffCreated: 'Akaun staf dicipta.', noServer: 'Tidak dapat menghubungi pelayan.', sessionExpired: 'Sesi tamat. Sila log masuk semula.' },
}

export function ManagementPage({ lang }: { lang: Lang }) {
  const t = labels[lang]
  const [token, setToken] = useState(() => sessionStorage.getItem('sibpr_token') || '')
  const [role, setRole] = useState<Role | null>(null)
  const [checking, setChecking] = useState(Boolean(token))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [date, setDate] = useState(nextSunday)
  const [service, setService] = useState<Service>(() => blank(nextSunday()))
  const [savedServices, setSavedServices] = useState<Service[]>([])
  const [loadingService, setLoadingService] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [staffUsername, setStaffUsername] = useState('')
  const [staffEmail, setStaffEmail] = useState('')
  const [staffPassword, setStaffPassword] = useState('')
  const [activeView, setActiveView] = useState<'schedule' | 'weekly' | 'staff'>('schedule')

  function signOut() { sessionStorage.removeItem('sibpr_token'); setToken(''); setRole(null); setSavedServices([]); setPassword(''); setActiveView('schedule') }
  useEffect(() => {
    if (!token) { setChecking(false); return }
    let cancelled = false
    setChecking(true)
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(async response => {
      if (!response.ok) throw Error(t.sessionExpired)
      return response.json() as Promise<{ role: Role }>
    }).then(data => { if (!cancelled) setRole(data.role) }).catch(() => { if (!cancelled) signOut() }).finally(() => { if (!cancelled) setChecking(false) })
    return () => { cancelled = true }
  }, [token])
  async function loadList() {
    const response = await fetch('/api/management/services', { headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) throw Error(t.noServer)
    setSavedServices(await response.json())
  }
  useEffect(() => { if (role) loadList().catch(() => setMessage(t.noServer)) }, [role])
  useEffect(() => {
    if (!role || !isSunday(date)) { setService(blank(date)); setLoadingService(false); return }
    let cancelled = false
    setService(blank(date)); setLoadingService(true)
    fetch(`/api/services/${date}`).then(async response => { if (!response.ok) throw Error(t.noServer); return response.json() as Promise<Service> }).then(data => { if (!cancelled) setService(data) }).catch(() => { if (!cancelled) setMessage(t.noServer) }).finally(() => { if (!cancelled) setLoadingService(false) })
    return () => { cancelled = true }
  }, [date, role])

  async function signIn(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
      const data = await response.json()
      if (!response.ok) throw Error(data.error || t.noServer)
      sessionStorage.setItem('sibpr_token', data.token)
      setToken(data.token); setRole(data.role); setPassword('')
    } catch (error) { setMessage((error as Error).message) } finally { setBusy(false) }
  }
  async function save(selection: Selection) { if (!isSunday(date)) { setMessage(t.invalidDate); return }; if (loadingService) return
    setBusy(true); setMessage('')
    try {
      const response = await fetch(`/api/management/services/${date}/publish`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ theme: service.theme, scripture: service.scripture, notes: service.notes, selection }) })
      const data = await response.json()
      if (!response.ok) throw Error(data.error || t.noServer)
      setService(current => ({ ...current, id: current.id || date, selection })); await loadList(); setMessage(t.saved)
    } catch (error) { setMessage((error as Error).message) } finally { setBusy(false) }
  }
  async function remove() {
    if (!service.id || !window.confirm(t.confirmDelete)) return
    setBusy(true); setMessage('')
    try {
      const response = await fetch(`/api/services/${date}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) throw Error((await response.json()).error || t.noServer)
      setService(blank(date)); await loadList(); setMessage(t.deleted)
    } catch (error) { setMessage((error as Error).message) } finally { setBusy(false) }
  }
  async function createStaff(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/admin/staff', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ username: staffUsername, email: staffEmail, password: staffPassword }) })
      if (!response.ok) throw Error((await response.json()).error || t.noServer)
      setStaffUsername(''); setStaffEmail(''); setStaffPassword(''); setMessage(t.staffCreated)
    } catch (error) { setMessage((error as Error).message) } finally { setBusy(false) }
  }
  function setTeam(key: keyof Teams, value: string) { setService(current => ({ ...current, teams: { ...current.teams, [key]: value.split('\n') } })) }
  function newSchedule() { const start = nextSunday(); const used = new Set(savedServices.map(item => item.date)); const day = new Date(`${start}T12:00:00Z`); while (used.has(day.toISOString().slice(0, 10))) day.setUTCDate(day.getUTCDate() + 7); const next = day.toISOString().slice(0, 10); setDate(next); setService(blank(next)); setMessage('') }

  return <div className="management-page"><header className="management-appbar"><div className="container management-appbar-inner"><img src="/sibpr-logo.jpeg" alt="" width="38" height="38"/><div className="management-appbar-brand"><strong>SIB PEKAN RANAU</strong><span>{lang === 'bm' ? 'PORTAL PENGURUSAN' : 'MANAGEMENT PORTAL'}</span></div><span className="management-appbar-access">{role ? (role === 'admin' ? 'ADMINISTRATOR' : 'STAFF') : (lang === 'bm' ? 'AKSES TERHAD' : 'RESTRICTED ACCESS')}</span></div></header><div className="container management-shell">{role && <div className="management-top"><button className="management-signout" onClick={signOut}><LogOut size={17}/>{t.logout}</button></div>}<div className="management-heading"><span className="eyebrow"><span className="eyebrow-line"/>SIB PEKAN RANAU</span><h1>{t.title}</h1><p>{t.subtitle}</p></div>
    {checking ? <p className="management-status">{lang === 'bm' ? 'Menyemak sesi…' : 'Checking session…'}</p> : !role ? <form className="management-login" onSubmit={signIn}><h2>{t.login}</h2><label>{t.username}<input required autoComplete="username" value={username} onChange={event => setUsername(event.target.value)}/></label><label>{t.password}<input required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)}/></label><button className="btn btn-gold" disabled={busy}>{t.signIn}</button></form> : <><nav className="management-subnav" aria-label={lang === 'bm' ? 'Bahagian pengurusan' : 'Management sections'}><button type="button" className={activeView === 'schedule' ? 'active' : ''} aria-current={activeView === 'schedule' ? 'page' : undefined} onClick={() => setActiveView('schedule')}><CalendarDays size={18}/>{lang === 'bm' ? 'Sunting jadual' : 'Edit Schedule'}</button><button type="button" className={activeView === 'weekly' ? 'active' : ''} aria-current={activeView === 'weekly' ? 'page' : undefined} onClick={() => setActiveView('weekly')}><Users size={18}/>{lang === 'bm' ? 'Ibadah Ahad mingguan' : 'Weekly Sunday Services'}</button>{role === 'admin' && <button type="button" className={activeView === 'staff' ? 'active' : ''} aria-current={activeView === 'staff' ? 'page' : undefined} onClick={() => setActiveView('staff')}><Plus size={18}/>{lang === 'bm' ? 'Cipta akaun staf' : 'Create Staff Account'}</button>}</nav><div className={activeView === 'schedule' ? 'management-layout' : 'management-layout management-layout-single'}><aside className="management-list" hidden={activeView !== 'schedule'}><div className="management-list-heading"><CalendarDays size={20}/><h2>{t.list}</h2></div><button className="management-new" onClick={newSchedule}><Plus size={17}/>{t.create}</button>{savedServices.length ? savedServices.map(item => <button key={item.date} className={date === item.date ? 'management-list-item active' : 'management-list-item'} onClick={() => { setDate(item.date); setMessage('') }}><strong>{new Intl.DateTimeFormat(lang === 'bm' ? 'ms-MY' : 'en-MY', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${item.date}T12:00:00Z`))}</strong><span>{item.theme || (lang === 'bm' ? 'Ibadah Ahad' : 'Sunday service')}</span></button>) : <p className="management-empty">{t.empty}</p>}</aside><div className="management-content"><form className="management-form" hidden={activeView !== 'schedule'} onSubmit={event => event.preventDefault()}><div className="management-form-head"><h2>{service.id ? (lang === 'bm' ? 'Edit jadual' : 'Edit schedule') : t.create}</h2><span>{role === 'admin' ? 'Admin' : 'Staff'}</span></div><label>{t.date}<input type="date" required value={date} onChange={event => { setDate(event.target.value); setMessage('') }}/></label>{date && !isSunday(date) && <p className="feedback error">{t.invalidDate}</p>}<fieldset className="management-fieldset" disabled={loadingService || busy}><div className="management-fields"><div className="management-section-title management-full">{lang === 'bm' ? 'Butiran ibadah' : 'Service details'}</div><label>{t.theme}<input maxLength={120} value={service.theme} onChange={event => setService(current => ({ ...current, theme: event.target.value }))}/></label><label>{t.scripture}<input maxLength={120} value={service.scripture} onChange={event => setService(current => ({ ...current, scripture: event.target.value }))}/></label><div className="management-section-title management-full">{lang === 'bm' ? 'Maklumat tambahan' : 'Additional information'}</div><label className="management-full">{t.notes}<textarea rows={4} maxLength={1000} value={service.notes} onChange={event => setService(current => ({ ...current, notes: event.target.value }))}/></label></div></fieldset><div className="management-actions"><button className="btn btn-gold" type="button" disabled={!isSunday(date) || loadingService} onClick={() => setActiveView('weekly')}>{lang === 'bm' ? 'Teruskan ke ibadah mingguan' : 'Continue to weekly service'}</button>{service.id && <button className="management-delete" type="button" disabled={busy || loadingService} onClick={remove}><Trash2 size={17}/>{t.delete}</button>}</div></form><div hidden={activeView !== 'weekly'} className="management-weekly-view"><div className="management-view-intro"><div><span>{lang === 'bm' ? 'JADUAL DIPILIH' : 'SELECTED SCHEDULE'}</span><strong>{date}</strong><p>{lang === 'bm' ? 'Tetapkan pasukan dan siarkan jadual Ahad ini.' : 'Assign the teams and publish this Sunday schedule.'}</p></div><button type="button" className="roster-outline" onClick={() => setActiveView('schedule')}>{lang === 'bm' ? 'Sunting butiran' : 'Edit details'}</button></div><SundayRosterEditor lang={lang} token={token} service={service} date={date} busy={busy || loadingService || !isSunday(date)} onPublish={save} onError={setMessage}/></div>{role === 'admin' && <form className="management-staff" hidden={activeView !== 'staff'} onSubmit={createStaff}><div className="management-list-heading"><Users size={20}/><h2>{t.staff}</h2></div><div className="management-staff-fields"><label>{t.staffUsername}<input required minLength={3} maxLength={40} pattern="[A-Za-z0-9._-]+" autoComplete="off" value={staffUsername} onChange={event => setStaffUsername(event.target.value)}/></label><label>{t.staffEmail}<input type="email" required autoComplete="off" value={staffEmail} onChange={event => setStaffEmail(event.target.value)}/></label><label>{t.staffPassword}<input type="password" required minLength={12} autoComplete="new-password" value={staffPassword} onChange={event => setStaffPassword(event.target.value)}/></label></div><button className="btn btn-green" disabled={busy}>{t.createStaff}</button></form>}</div></div></>}
    {message && <p className="management-status" role="status">{message}</p>}
  </div></div>
}
