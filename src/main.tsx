import { useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, ChevronLeft, ChevronRight, Clock3, Heart, MapPin, Menu, Moon, Music2, Sun, Users, Video, X } from 'lucide-react'
import { MinistryPage } from './MinistryPage'
import { JoinPopup } from './JoinPopup'
import { HeroCarousel, type HeroSlide } from './HeroCarousel'
import { EventsSection } from './EventsSection'
import { ManagementPage } from './ManagementPage'
import { PublicRoster } from './PublicRoster'
import { LocalStartPage } from './LocalStartPage'
import './index.css'
import './public-refresh.css'

if (window.location.pathname === '/') {
  window.history.replaceState(window.history.state, '', `/Mainpage${window.location.search}${window.location.hash}`)
}

type Lang = 'bm' | 'en'
type MinistryKey = 'wanita' | 'wira' | 'muda-mudi'
const ministryPaths: Record<MinistryKey, string> = { wanita: '/pelayanan-wanita', wira: '/pelayanan-wira', 'muda-mudi': '/pelayanan-muda-mudi' }
type Teams = { praise: string[]; ushers: string[]; leaders: string[]; multimedia: string[] }
type RosterPerson = { id: string; name: string; photo: string; role: string }
type Service = { date: string; theme: string; scripture: string; notes: string; teams: Teams; roster?: { musicians: RosterPerson[]; worshipLeader: RosterPerson | null; singers: RosterPerson[]; multimedia: RosterPerson[] } }
const teamKeys: (keyof Teams)[] = ['praise', 'ushers', 'leaders', 'multimedia']
const blankTeams: Teams = { praise: [], ushers: [], leaders: [], multimedia: [] }
const heroSlides: HeroSlide[] = [
  { src: '/hero-video/choir-1.mp4', poster: '/hero-video/choir-1.jpg', label: { bm: 'Bersama dalam pujian', en: 'Together in worship' } },
  { src: '/hero-video/choir-2.mp4', poster: '/hero-video/choir-2.jpg', label: { bm: 'Iman yang hidup', en: 'Faith in action' } },
  { src: '/hero-video/choir-3.mp4', poster: '/hero-video/choir-3.jpg', label: { bm: 'Melayani bersama', en: 'Serving together' } },
]
const copy = {
  bm: { home: 'Utama', service: 'Ibadah Ahad', ministries: 'Pelayanan', connect: 'Hubungi Kami', about: 'Tentang Kami', aboutTag: 'TENTANG SIBPR', aboutTitle: 'Kenali SIB Pekan Ranau.', aboutText: 'SIB Pekan Ranau ialah komuniti gereja di Ranau, Sabah. Kami berkumpul untuk beribadah, bertumbuh dalam iman dan melayani bersama.', aboutWelcome: 'Anda dialu-alukan', aboutWelcomeText: 'Sama ada anda baru di Ranau atau mencari tempat untuk bersekutu, kami mengalu-alukan anda untuk datang beribadah bersama.', aboutGather: 'Ibadah bersama', aboutGatherText: 'Kami bertemu setiap Ahad pada pukul 9:00 pagi di SIB Pekan Ranau, Sabah.', events: 'Aktiviti', eventsTag: 'ACARA & AKTIVITI', eventsTitle: 'Apa yang berlaku di SIBPR.', eventsText: 'Ikuti pertemuan mingguan dan maklumat aktiviti gereja.', weeklyEvent: 'Ibadah Ahad', weeklyEventText: 'Mari beribadah bersama kami setiap Ahad, 9:00 pagi di SIB Pekan Ranau.', eventUpdates: 'Aktiviti akan datang', eventUpdatesText: 'Maklumat acara dan aktiviti baharu akan diumumkan di sini.', eyebrow: 'SELAMAT DATANG KE', hero: 'Rumah untuk bertumbuh bersama.', heroText: 'Sebuah komuniti iman di tengah Ranau. Mari beribadah, bersekutu dan melayani bersama kami setiap hari Ahad.', join: 'Jom beribadah bersama', explore: 'Kenali pelayanan kami', next: 'IBADAH MINGGUAN', sunday: 'Setiap Ahad, kita berkumpul.', sundayText: 'Luangkan masa untuk memuji Tuhan, mendengar Firman dan membina hubungan yang bermakna.', every: 'SETIAP AHAD', time: '9:00 PAGI', place: 'SIB Pekan Ranau, Sabah', view: 'Lihat jadual pelayanan', ministryTag: 'CARI TEMPAT ANDA', ministryTitle: 'Ada tempat untuk semua.', ministryText: 'Temui komuniti yang berjalan bersama anda dalam setiap musim kehidupan.', women: 'Pelayanan Wanita', womenDesc: 'Bertumbuh dalam iman, persahabatan dan doa bersama wanita lain.', men: 'Pelayanan Wira', menDesc: 'Ruang untuk lelaki saling menguatkan dan melayani.', youth: 'Pelayanan Muda Mudi', youthDesc: 'Iman, persahabatan dan tujuan untuk generasi muda.', belong: 'Jadi sebahagian daripada keluarga kami.', belongText: 'Baru di Ranau atau sedang mencari komuniti? Anda dialu-alukan untuk datang seperti seadanya.', visit: 'Jumpa kami hari Ahad', partner: 'BERSAMA MEMBINA', partnerTitle: 'Berkongsi harapan. Melayani bersama.', partnerText: 'Kami mengalu-alukan kerjasama dan sokongan bagi pelayanan komuniti gereja.', partnerBtn: 'Jadi rakan kerjasama', donate: 'Jom Donate', donateText: 'Ingin menyokong pelayanan SIB Pekan Ranau? Hubungi gereja untuk maklumat sumbangan rasmi.', donateBtn: 'Tanya tentang sumbangan', schedule: 'JADUAL IBADAH AHAD', scheduleTitle: 'Minggu ini di gereja.', scheduleText: 'Lihat pasukan yang melayani pada hari Ahad. Jadual boleh dikemas kini oleh pentadbir pelayanan.', noSchedule: 'Jadual pelayanan untuk Ahad ini belum diterbitkan.', praise: 'Pujian & Penyembahan', ushers: 'Penyambut Tetamu', leaders: 'Pemimpin & Penyanyi', multimedia: 'Multimedia & PA System', noTeam: 'Belum ditetapkan', theme: 'Tema', scripture: 'Bacaan Firman', notes: 'Catatan', admin: 'Pentadbir', login: 'Log masuk pentadbir', logout: 'Log keluar', save: 'Simpan jadual', saving: 'Menyimpan...', email: 'E-mel', password: 'Kata laluan', signIn: 'Log masuk', editor: 'Kemaskini jadual', membersHint: 'Masukkan satu nama pada setiap baris.', saved: 'Jadual berjaya disimpan.', failed: 'Tidak dapat memuatkan jadual. Cuba lagi.', footer: 'Beribadah. Bertumbuh. Melayani.', contact: 'Hubungi gereja', contactHint: 'Maklumat hubungan rasmi akan ditambah kemudian.' },
  en: { home: 'Home', service: 'Sunday Service', ministries: 'Ministries', connect: 'Connect', about: 'About Us', aboutTag: 'ABOUT SIBPR', aboutTitle: 'Get to know SIB Pekan Ranau.', aboutText: 'SIB Pekan Ranau is a church community in Ranau, Sabah. We gather to worship, grow in faith, and serve together.', aboutWelcome: 'You are welcome', aboutWelcomeText: 'Whether you are new to Ranau or looking for a place to connect, you are welcome to worship with us.', aboutGather: 'Gather with us', aboutGatherText: 'We meet every Sunday at 9:00 AM at SIB Pekan Ranau, Sabah.', events: 'Events', eventsTag: 'EVENTS & ACTIVITIES', eventsTitle: 'What is happening at SIBPR.', eventsText: 'Follow our weekly gathering and church activity updates.', weeklyEvent: 'Sunday Service', weeklyEventText: 'Join us every Sunday at 9:00 AM at SIB Pekan Ranau.', eventUpdates: 'Upcoming activities', eventUpdatesText: 'New event and activity details will be announced here.', eyebrow: 'WELCOME TO', hero: 'A place to grow together.', heroText: 'A faith community in the heart of Ranau. Come worship, connect, and serve with us every Sunday.', join: 'Join us this Sunday', explore: 'Explore our ministries', next: 'WEEKLY GATHERING', sunday: 'Every Sunday, we gather.', sundayText: 'Make time to worship God, hear the Word, and build meaningful connections.', every: 'EVERY SUNDAY', time: '9:00 AM', place: 'SIB Pekan Ranau, Sabah', view: 'View service schedule', ministryTag: 'FIND YOUR PLACE', ministryTitle: 'There is room for everyone.', ministryText: 'Find a community to walk with you through every season of life.', women: "Women's Ministry", womenDesc: 'Grow in faith, friendship, and prayer with other women.', men: "Men's Ministry", menDesc: 'A space for men to encourage one another and serve.', youth: 'Youth Ministry', youthDesc: 'Faith, friendship, and purpose for the next generation.', belong: 'Become part of our family.', belongText: 'New to Ranau or looking for community? You are welcome to come as you are.', visit: 'See you on Sunday', partner: 'BUILDING TOGETHER', partnerTitle: 'Share hope. Serve together.', partnerText: 'We welcome partnerships and support for the work of our church community.', partnerBtn: 'Explore partnership', donate: 'Jom Donate', donateText: 'Want to support SIB Pekan Ranau? Contact the church for official giving information.', donateBtn: 'Ask about giving', schedule: 'SUNDAY SERVICE SCHEDULE', scheduleTitle: 'This week at church.', scheduleText: 'See the teams serving this Sunday. Ministry administrators can update the schedule.', noSchedule: 'The ministry schedule for this Sunday has not been published yet.', praise: 'Praise & Worship', ushers: 'Ushers', leaders: 'Worship Leaders & Singers', multimedia: 'Multimedia & PA System', noTeam: 'To be assigned', theme: 'Theme', scripture: 'Scripture', notes: 'Notes', admin: 'Admin', login: 'Admin sign in', logout: 'Sign out', save: 'Save schedule', saving: 'Saving...', email: 'Email', password: 'Password', signIn: 'Sign in', editor: 'Edit schedule', membersHint: 'Enter one name per line.', saved: 'Schedule saved.', failed: 'Could not load the schedule. Try again.', footer: 'Worship. Grow. Serve.', contact: 'Contact the church', contactHint: 'Official contact details will be added soon.' }
}
function nextSunday(offset = 0) { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + ((7 - d.getDay()) % 7) + offset * 7); return d.toISOString().slice(0, 10) }
function App() {
  const [lang, setLang] = useState<Lang>('en'); const t = copy[lang]
  const [theme, setTheme] = useState<'light' | 'dark'>(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  const [activeSection, setActiveSection] = useState('home')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [route, setRoute] = useState(window.location.pathname)
  const landingPage = route === '/' || route === '/Mainpage'
  const [joinOpen, setJoinOpen] = useState(false)
  const ministryPage = (Object.keys(ministryPaths) as MinistryKey[]).find(key => ministryPaths[key] === route)
  const servicePage = route === '/sunday-service'
  const eventsPage = route === '/events'
  const managementPage = route === '/management'
  const localStartPage = import.meta.env.DEV && route === '/start'
  const closeJoin = useCallback(() => setJoinOpen(false), [])
  const [week, setWeek] = useState(0); const [service, setService] = useState<Service>({ date: nextSunday(), theme: '', scripture: '', notes: '', teams: blankTeams })
  const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [menu, setMenu] = useState(false)
  const date = nextSunday(week)
  useEffect(() => {
    const onPopState = () => { setRoute(window.location.pathname); window.scrollTo(0, 0) }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang === 'bm' ? 'ms' : 'en'
    document.title = ministryPage ? `${t[ministryPage === 'wanita' ? 'women' : ministryPage === 'wira' ? 'men' : 'youth']} | SIB Pekan Ranau` : servicePage ? `${t.service} | SIB Pekan Ranau` : eventsPage ? `${t.events} | SIB Pekan Ranau` : managementPage ? 'SIBPR Management' : localStartPage ? 'SIBPR Local Start' : 'SIB Pekan Ranau'
  }, [lang, ministryPage, servicePage, eventsPage, managementPage, localStartPage, t])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#17181a' : '#15382f')
    try { localStorage.setItem('sibpr-theme', theme) } catch { /* Storage may be unavailable. */ }
  }, [theme])
  useEffect(() => { setLoading(true); setError(''); fetch(`/api/services/${date}`).then(async r => { if (!r.ok) throw Error(); return r.json() }).then(data => setService(data)).catch(() => { setService({ date, theme: '', scripture: '', notes: '', teams: blankTeams }); setError(t.failed) }).finally(() => setLoading(false)) }, [date, route])
  useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0)
      const current = managementPage ? 'home' : ministryPage ? 'ministries' : servicePage ? 'sunday' : eventsPage ? 'events' : ['home', 'about', 'events', 'sunday', 'ministries', 'connect'].reduce((found, id) => {
        const element = document.getElementById(id)
        return element && element.getBoundingClientRect().top <= window.innerHeight * 0.38 ? id : found
      }, 'home')
      setActiveSection(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [ministryPage, servicePage, eventsPage, managementPage])
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [ministryPage, servicePage, eventsPage, managementPage])
  const formatted = new Intl.DateTimeFormat(lang === 'bm' ? 'ms-MY' : 'en-MY', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' }).format(new Date(`${date}T12:00:00Z`))
  function go(id: string) {
    setMenu(false)
    if (id === 'events') {
      if (!eventsPage) window.history.pushState({}, '', '/events')
      setRoute('/events')
      window.scrollTo(0, 0)
      return
    }
    if (id === 'sunday') {
      if (!servicePage) window.history.pushState({}, '', '/sunday-service')
      setRoute('/sunday-service')
      window.scrollTo(0, 0)
      return
    }
    if (!landingPage) {
      window.history.pushState({}, '', '/Mainpage')
      setRoute('/Mainpage')
      setActiveSection(id)
      requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })))
    } else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }
  function openMinistry(key: MinistryKey) {
    window.history.pushState({}, '', ministryPaths[key])
    setRoute(ministryPaths[key])
    setMenu(false)
    window.scrollTo(0, 0)
  }
  function joinAndGo(id: string) { setJoinOpen(false); go(id) }
  const scheduleSection = <section className="schedule-section" id="sunday"><div className="container"><div className="section-heading reveal"><div><div className="eyebrow"><span className="eyebrow-line"/>{t.schedule}</div><h2>{t.scheduleTitle}</h2></div><p>{t.scheduleText}</p></div><div className="schedule-panel reveal"><div className="schedule-top"><div><span className="small-label">{t.service.toUpperCase()}</span><h3>{formatted}</h3><p><Clock3 size={17}/> {t.time} <span>·</span> <MapPin size={17}/> {t.place}</p></div><div className="date-switch"><button disabled={week === 0} onClick={() => setWeek(Math.max(0, week - 1))} aria-label="Previous Sunday"><ChevronLeft size={20}/></button><button onClick={() => setWeek(week + 1)} aria-label="Next Sunday"><ChevronRight size={20}/></button></div></div>{error && <p className="feedback error">{error}</p>}{service.theme && <div className="service-theme"><b>{t.theme}</b> {service.theme}{service.scripture && <span> · {service.scripture}</span>}</div>}{!loading && !teamKeys.some(k => service.teams[k]?.length) && !service.theme && <div className="empty-state">{t.noSchedule}</div>}<div className="teams-grid">{teamKeys.filter(key => key !== 'leaders').map(key => { const Icon = key === 'praise' ? Music2 : key === 'ushers' ? Users : Video; return <div className="team-row" key={key}><span className="team-icon"><Icon size={20}/></span><div><h4>{t[key]}</h4><p>{service.teams[key]?.filter(Boolean).join(', ') || t.noTeam}</p></div></div> })}</div><PublicRoster roster={service.roster} legacyLeaders={service.teams.leaders} lang={lang}/>{service.notes && <p className="service-notes">{service.notes}</p>}</div></div></section>
  const nav = [{ id: 'home', label: t.home }, { id: 'about', label: t.about }, { id: 'events', label: t.events }, { id: 'sunday', label: t.service }, { id: 'ministries', label: t.ministries }, { id: 'connect', label: t.connect }]
  return <>
    {!managementPage && !localStartPage && (    <header className="site-header"><div className="scroll-progress" style={{ width: `${scrollProgress}%` }} aria-hidden="true"/><div className="container header-inner"><button className="brand" onClick={() => go('home')} aria-label="SIB Pekan Ranau home"><img className="brand-logo" src="/sibpr-logo.jpeg" alt="" width="46" height="46"/><span>SIB <strong>PEKAN RANAU</strong></span></button><nav className={menu ? 'nav open' : 'nav'} aria-label="Main navigation">{nav.map(n => <button key={n.id} className={activeSection === n.id ? "current" : ""} aria-current={activeSection === n.id ? "page" : undefined} onClick={() => go(n.id)}>{n.label}</button>)}</nav><div className="header-actions"><button className="theme-toggle" type="button" onClick={() => setTheme(current => current === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? (lang === 'bm' ? 'Aktifkan mod gelap' : 'Switch to dark mode') : (lang === 'bm' ? 'Aktifkan mod cerah' : 'Switch to light mode')} title={theme === 'light' ? (lang === 'bm' ? 'Mod gelap' : 'Dark mode') : (lang === 'bm' ? 'Mod cerah' : 'Light mode')}>{theme === 'light' ? <Moon size={19}/> : <Sun size={19}/>}</button><div className="language" aria-label="Language"><button className={lang === 'bm' ? 'active' : ''} onClick={() => setLang('bm')}>BM</button><span>|</span><button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button></div><button className="menu-toggle" onClick={() => setMenu(!menu)} aria-label="Toggle menu">{menu ? <X size={22}/> : <Menu size={22}/>}</button></div></div></header>)}
    <main>{localStartPage ? <LocalStartPage/> : managementPage ? <ManagementPage lang={lang}/> : ministryPage ? <MinistryPage ministry={ministryPage} lang={lang} onBack={() => go("ministries")} onJoin={() => setJoinOpen(true)} onSchedule={() => go("sunday")}/> : eventsPage ? <><section className="service-page-hero events-page-hero"><div className="container service-page-hero-inner"><button className="ministry-back" onClick={() => go('home')}><ArrowRight className="service-back-arrow" size={17}/>{lang === 'bm' ? 'Kembali ke utama' : 'Back to home'}</button><div className="eyebrow light"><span className="eyebrow-line"/>{t.eventsTag}</div><h1>{lang === 'bm' ? 'Acara & Aktiviti' : 'Events & Activities'}</h1><p>{lang === 'bm' ? 'Lihat aktiviti gereja dalam senarai dan kalendar bulanan.' : 'Browse church activities in the list and monthly calendar.'}</p></div></section><EventsSection lang={lang} onSchedule={() => go('sunday')}/></> : servicePage ? <><section className="service-page-hero"><div className="container service-page-hero-inner"><button className="ministry-back" onClick={() => go('home')}><ArrowRight className="service-back-arrow" size={17}/>{lang === 'bm' ? 'Kembali ke utama' : 'Back to home'}</button><div className="eyebrow light"><span className="eyebrow-line"/>{t.schedule}</div><h1>{t.service}</h1><p>{t.scheduleText}</p><div className="service-page-meta"><span><Clock3 size={18}/>{t.time}</span><span><MapPin size={18}/>{t.place}</span></div></div></section>{scheduleSection}</> : <><section className="hero" id="home"><div className="hero-visual"/><div className="hero-overlay"/><div className={heroSlides.length ? "container hero-content hero-split" : "container hero-content"}><div className="hero-copy"><div className="eyebrow light"><span className="eyebrow-line"/>{t.eyebrow} SIB PEKAN RANAU</div><h1>{t.hero}</h1><p>{t.heroText}</p><div className="hero-service-chip"><Clock3 size={18}/><span><strong>{t.every} · {t.time}</strong><small>{t.place}</small></span></div><div className="hero-buttons"><button className="btn btn-gold" onClick={() => go('sunday')}>{t.join}<ArrowRight size={18}/></button><button className="text-link light-link" onClick={() => go('ministries')}>{t.explore}<ArrowRight size={17}/></button></div></div>{heroSlides.length > 0 && <HeroCarousel slides={heroSlides} lang={lang}/>}</div><div className="hero-bottom container"><span>SIB PEKAN RANAU</span><span>RANAU · SABAH</span></div></section>
    <section className="about-section" id="about"><div className="container about-layout"><div className="about-copy reveal"><div className="eyebrow"><span className="eyebrow-line"/>{t.aboutTag}</div><h2>{t.aboutTitle}</h2><p>{t.aboutText}</p><button className="text-link" onClick={() => setJoinOpen(true)}>{lang === 'bm' ? 'Kenali keluarga SIBPR' : 'Meet the SIBPR family'}<ArrowRight size={17}/></button></div><div className="about-details reveal"><article><span className="about-icon"><Heart size={22}/></span><div><h3>{t.aboutWelcome}</h3><p>{t.aboutWelcomeText}</p></div></article><article><span className="about-icon"><Clock3 size={22}/></span><div><h3>{t.aboutGather}</h3><p>{t.aboutGatherText}</p></div></article></div></div></section>
    <EventsSection lang={lang} onSchedule={() => go('sunday')} onViewPage={() => go('events')}/>
    {scheduleSection}
    <section className="ministries-section" id="ministries"><div className="container"><div className="section-heading reveal"><div><div className="eyebrow"><span className="eyebrow-line"/>{t.ministryTag}</div><h2>{t.ministryTitle}</h2></div><p>{t.ministryText}</p></div><div className="ministry-grid"><article className="ministry-card women reveal"><div className="card-image"/><div className="ministry-content"><span>01 — KOMUNITI</span><h3>{t.women}</h3><p>{t.womenDesc}</p><button onClick={() => openMinistry("wanita")} aria-label={`${t.women}: ${lang === "bm" ? "Lihat halaman" : "View page"}`}><span>{lang === "bm" ? "Lihat halaman" : "View page"}</span><ArrowRight size={18}/></button></div></article><article className="ministry-card men reveal"><div className="card-image"/><div className="ministry-content"><span>02 — KOMUNITI</span><h3>{t.men}</h3><p>{t.menDesc}</p><button onClick={() => openMinistry("wira")} aria-label={`${t.men}: ${lang === "bm" ? "Lihat halaman" : "View page"}`}><span>{lang === "bm" ? "Lihat halaman" : "View page"}</span><ArrowRight size={18}/></button></div></article><article className="ministry-card youth reveal"><div className="card-image"/><div className="ministry-content"><span>03 — KOMUNITI</span><h3>{t.youth}</h3><p>{t.youthDesc}</p><button onClick={() => openMinistry("muda-mudi")} aria-label={`${t.youth}: ${lang === "bm" ? "Lihat halaman" : "View page"}`}><span>{lang === "bm" ? "Lihat halaman" : "View page"}</span><ArrowRight size={18}/></button></div></article></div></div></section>
    <section className="community-section" id="connect"><div className="container"><div className="community-intro reveal"><div className="eyebrow light"><span className="eyebrow-line"/>{t.partner}</div><h2>{t.belong}</h2><p>{t.belongText}</p></div><div className="community-grid"><article className="community-card community-join reveal"><span className="community-icon"><Heart size={26}/></span><h3>{lang === 'bm' ? 'Sertai keluarga SIBPR' : 'Join the SIBPR family'}</h3><p>{t.belongText}</p><button className="btn btn-gold" onClick={() => setJoinOpen(true)}>{lang === 'bm' ? 'Jadi sebahagian daripada keluarga SIBPR' : 'Join the SIBPR family'}<ArrowRight size={17}/></button></article><article className="community-card reveal"><span className="community-icon"><Users size={26}/></span><h3>{t.partnerBtn}</h3><p>{t.partnerText}</p><span className="community-note">{t.contactHint}</span></article><article className="community-card reveal"><span className="community-icon"><Heart size={26}/></span><h3>{t.donate}</h3><p>{t.donateText}</p><span className="community-note">{t.contactHint}</span></article></div></div></section></>}</main>
    {!managementPage && !localStartPage && (    <footer><div className="container footer-inner"><div><div className="footer-brand"><img className="footer-logo" src="/sibpr-logo.jpeg" alt="Logo SIB Pekan Ranau" width="58" height="58"/><span>SIB PEKAN RANAU</span></div><p>{t.footer}</p></div><div><span>{t.every} · {t.time}</span><span>{t.place}</span></div></div><div className="container copyright">© {new Date().getFullYear()} SIB Pekan Ranau</div></footer>)}
    {joinOpen && <JoinPopup lang={lang} onClose={closeJoin} onSchedule={() => joinAndGo('sunday')} onMinistries={() => joinAndGo('ministries')}/>}
  </>
}
createRoot(document.getElementById('root')!).render(<App />)

