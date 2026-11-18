import { ArrowLeft, ArrowRight, CalendarDays, Heart, Instagram, MessageCircle, Play, ShoppingBag, Sparkles, Users } from 'lucide-react'
import { youthContent } from './youthContent'
import './youth.css'

type Lang = 'bm' | 'en'
const copy = {
  bm: {
    back: 'Kembali ke utama', kicker: 'SIB PEKAN RANAU / GENERASI MUDA', title: 'Pelayanan Muda Mudi', intro: 'Tempat untuk datang seadanya, jumpa kawan baru, bertumbuh dalam iman dan mencipta cerita bersama.', explore: 'Teroka halaman', join: 'Jadi salah seorang daripada kami',
    committee: 'Barisan AJK Pelayanan Muda Mudi', committeeIntro: 'Kenali pasukan yang membantu menggerakkan komuniti muda mudi.', committeeEmpty: 'Barisan AJK akan diperkenalkan di sini tidak lama lagi.',
    activities: 'Aktiviti tahunan & akan datang', activitiesIntro: 'Ruang untuk perjumpaan, pelayanan dan kenangan sepanjang tahun.', activitiesEmpty: 'Tarikh aktiviti muda mudi belum diumumkan. Nantikan kemas kini di sini.', calendar: 'Lihat aktiviti gereja',
    blog: 'Cerita dari muda mudi', blogIntro: 'Kisah ringkas dan video daripada suara generasi muda.', blogEmpty: 'Cerita dan video muda mudi akan muncul di sini. Ada kisah untuk dikongsi? Jumpa kami di gereja.', story: 'CERITA', video: 'VIDEO',
    connect: 'Jadi salah seorang daripada kami', connectIntro: 'Ikuti perkembangan kami dan mula berkenalan. Anda sentiasa dialu-alukan.', contactSoon: 'Pautan rasmi akan ditambah tidak lama lagi.',
    shop: 'Jualan & Merchandise', shopIntro: 'Lihat barangan dan usaha kreatif muda mudi apabila tersedia.', shopEmpty: 'Belum ada barangan untuk dijual. Nantikan koleksi muda mudi di sini.',
  },
  en: {
    back: 'Back to home', kicker: 'SIB PEKAN RANAU / YOUTH', title: 'Pelayanan Muda Mudi', intro: 'Come as you are, make new friends, grow in faith, and create stories together.', explore: 'Explore the page', join: 'Be one of us',
    committee: 'Youth Ministry Committee', committeeIntro: 'Meet the team helping our youth community grow.', committeeEmpty: 'The youth committee will be introduced here soon.',
    activities: 'Yearly & upcoming activities', activitiesIntro: 'A place for gatherings, service, and memories throughout the year.', activitiesEmpty: 'Youth activity dates have not been announced yet. Watch this space for updates.', calendar: 'See church activities',
    blog: 'Stories from youth', blogIntro: 'Short stories and videos told by young voices.', blogEmpty: 'Youth stories and videos will appear here. Have a story to share? Come say hello at church.', story: 'STORY', video: 'VIDEO',
    connect: 'Be one of us', connectIntro: 'Follow along and get to know us. There is always room for you.', contactSoon: 'Official links will be added soon.',
    shop: 'Sales & Merchandise', shopIntro: 'Explore youth creations and merchandise when available.', shopEmpty: 'Nothing is on sale yet. Watch this space for youth merchandise.',
  },
}

function YouthIllustration() {
  return <svg className="youth-illustration" viewBox="0 0 520 420" role="img" aria-label="Illustration of three young friends together" xmlns="http://www.w3.org/2000/svg">
    <circle cx="265" cy="210" r="174" fill="#fff3d9"/><path d="M71 287c79-49 132-18 192 7 71 30 133-24 190-3v91H71z" fill="#b1d7bb"/>
    <path d="M92 120l10 22 23 7-23 7-10 22-9-22-24-7 24-7zM428 90l7 17 18 5-18 6-7 17-7-17-18-6 18-5z" fill="#ffbc67"/>
    <g stroke="#42323c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M96 376v-74c0-37 25-57 60-57s61 20 61 57v74" fill="#f49a7c"/><path d="M130 246l26 31 27-31" fill="none"/><circle cx="156" cy="197" r="44" fill="#d6976b"/><path d="M113 190c-6-48 21-65 53-59 29 4 41 24 34 58-12-15-33-14-43-31-8 16-25 26-44 32z" fill="#34354c"/><path d="M143 203h1m27 0h1"/><path d="M148 221c7 6 15 6 22 0" fill="none"/>
      <path d="M196 376v-94c0-39 26-62 68-62s69 23 69 62v94" fill="#8064b7"/><path d="M231 225l32 36 34-36" fill="none"/><circle cx="264" cy="168" r="52" fill="#e7ae7b"/><path d="M211 165c-4-52 20-77 59-76 37 0 58 27 47 77-12-19-38-34-51-48-11 22-28 35-55 47z" fill="#362e43"/><path d="M248 176h1m32 0h1"/><path d="M254 194c8 8 20 8 28 0" fill="none"/>
      <path d="M313 376v-75c0-38 25-60 62-60s62 22 62 60v75" fill="#f3c45c"/><circle cx="375" cy="190" r="46" fill="#b97656"/><path d="M329 184c-7-46 12-67 47-68 34-1 52 26 44 68-15-8-23-22-26-36-14 19-39 30-65 36z" fill="#322f43"/><path d="M361 199h1m27 0h1"/><path d="M365 216c6 6 16 6 23 0" fill="none"/>
    </g><path d="M208 299c-12-10-24-14-39-13m159 10c15-14 28-17 44-15" stroke="#42323c" strokeWidth="5" strokeLinecap="round" fill="none"/>
  </svg>
}

export function YouthPage({ lang, onBack, onActivities }: { lang: Lang; onBack: () => void; onActivities: () => void }) {
  const t = copy[lang]
  const socials = [
    { name: 'TikTok', url: youthContent.contact.tiktok, icon: <Play size={22} fill="currentColor"/> },
    { name: 'WhatsApp', url: youthContent.contact.whatsapp, icon: <MessageCircle size={24}/> },
    { name: 'Instagram', url: youthContent.contact.instagram, icon: <Instagram size={24}/> },
  ]
  return <div className="youth-page">
    <section className="youth-hero"><div className="container youth-hero-inner">
      <button className="youth-back" onClick={onBack}><ArrowLeft size={17}/>{t.back}</button>
      <div className="youth-hero-grid"><div className="youth-hero-copy"><span className="youth-kicker"><Sparkles size={18}/>{t.kicker}</span><h1>{t.title}</h1><p>{t.intro}</p><a className="youth-pill youth-pill-dark" href="#youth-committee">{t.explore}<ArrowRight size={19}/></a></div><div className="youth-art"><span className="youth-art-sticker">FAITH<br/>FRIENDS<br/>FUN!</span><YouthIllustration/></div></div>
      <nav className="youth-jump" aria-label={lang === 'bm' ? 'Bahagian halaman' : 'Page sections'}><a href="#youth-committee">AJK</a><a href="#youth-activities">{lang === 'bm' ? 'Aktiviti' : 'Activities'}</a><a href="#youth-blog">Blog</a><a href="#youth-connect">Connect</a><a href="#youth-shop">Merch</a></nav>
    </div></section>
    <section id="youth-committee" className="youth-section youth-committee"><div className="container"><div className="youth-section-heading"><span className="youth-overline">01 / OUR PEOPLE</span><h2>{t.committee}</h2><p>{t.committeeIntro}</p></div>{youthContent.committee.length ? <div className="youth-card-grid">{youthContent.committee.map(member => <article className="youth-person-card" key={member.name}>{member.photo ? <img src={member.photo} alt={member.name}/> : <div className="youth-avatar"><Users size={36}/></div>}<h3>{member.name}</h3><p>{member.role}</p></article>)}</div> : <div className="youth-empty youth-empty-committee"><div className="youth-empty-icon"><Users size={33}/></div><p>{t.committeeEmpty}</p></div>}</div></section>
    <section id="youth-activities" className="youth-section youth-activities"><div className="container"><div className="youth-section-heading"><span className="youth-overline">02 / WHAT'S ON</span><h2>{t.activities}</h2><p>{t.activitiesIntro}</p></div>{youthContent.activities.length ? <div className="youth-card-grid">{youthContent.activities.map(activity => <article className="youth-feature-card" key={activity.title + activity.date}>{activity.image && <img src={activity.image} alt=""/>}<span className="youth-card-tag"><CalendarDays size={16}/>{activity.date}</span><h3>{activity.title}</h3><p>{activity.description}</p></article>)}</div> : <div className="youth-empty youth-empty-activities"><CalendarDays size={34}/><p>{t.activitiesEmpty}</p></div>}<button className="youth-pill youth-pill-outline" onClick={onActivities}>{t.calendar}<ArrowRight size={18}/></button></div></section>
    <section id="youth-blog" className="youth-section youth-blog"><div className="container"><div className="youth-section-heading"><span className="youth-overline">03 / YOUTH VOICES</span><h2>{t.blog}</h2><p>{t.blogIntro}</p></div>{youthContent.stories.length ? <div className="youth-card-grid">{youthContent.stories.map(story => <article className="youth-feature-card" key={story.title}>{story.image && <img src={story.image} alt=""/>}<span className="youth-card-tag">{story.videoUrl ? <Play size={15}/> : <Heart size={15}/>} {story.videoUrl ? t.video : t.story}</span><h3>{story.title}</h3><p>{story.excerpt}</p><small>{story.author}</small>{story.videoUrl && <a href={story.videoUrl} target="_blank" rel="noopener noreferrer" className="youth-card-link">{lang === 'bm' ? 'Tonton video' : 'Watch video'}<ArrowRight size={16}/></a>}</article>)}</div> : <div className="youth-empty youth-empty-blog"><div className="youth-story-doodle"><span>✦</span><span>✳</span><span>✦</span></div><p>{t.blogEmpty}</p></div>}</div></section>
    <section id="youth-connect" className="youth-section youth-connect"><div className="container youth-connect-grid"><div><span className="youth-overline">04 / STAY CONNECTED</span><h2>{t.connect}</h2><p>{t.connectIntro}</p></div><div className="youth-socials">{socials.map(social => social.url ? <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="youth-social">{social.icon}<span>{social.name}</span><ArrowRight size={19}/></a> : <div key={social.name} className="youth-social youth-social-pending">{social.icon}<span>{social.name}</span><small>{t.contactSoon}</small></div>)}</div></div></section>
    <section id="youth-shop" className="youth-section youth-shop"><div className="container"><div className="youth-section-heading"><span className="youth-overline">05 / MADE WITH HEART</span><h2>{t.shop}</h2><p>{t.shopIntro}</p></div>{youthContent.merchandise.length ? <div className="youth-card-grid">{youthContent.merchandise.map(item => <article className="youth-feature-card" key={item.name}>{item.image && <img src={item.image} alt=""/>}<span className="youth-card-tag"><ShoppingBag size={16}/>{item.price}</span><h3>{item.name}</h3>{item.description && <p>{item.description}</p>}</article>)}</div> : <div className="youth-empty youth-empty-shop"><ShoppingBag size={36}/><p>{t.shopEmpty}</p></div>}</div></section>
  </div>
}
