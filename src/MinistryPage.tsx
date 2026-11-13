import { ArrowLeft, ArrowRight, CalendarDays, Heart, MapPin, Users } from 'lucide-react'

type MinistryKey = 'wanita' | 'wira' | 'muda-mudi'
type Lang = 'bm' | 'en'
const content = {
  bm: {
    back: 'Kembali ke utama', tag: 'PELAYANAN SIB PEKAN RANAU', intro: 'Tempat untuk mengenali satu sama lain, bertumbuh dalam iman dan melayani bersama.',
    invite: 'Anda dialu-alukan', inviteText: 'Ingin mengenali pelayanan ini? Datang beribadah bersama kami pada hari Ahad dan berkenalan dengan komuniti SIB Pekan Ranau.',
    gather: 'Bertumbuh bersama', gatherText: 'Ruang untuk berkongsi perjalanan iman dan saling menguatkan.',
    serve: 'Melayani bersama', serveText: 'Temui cara untuk menggunakan bakat dan masa anda bagi komuniti.',
    sunday: 'Mulakan dengan ibadah Ahad', time: 'Setiap Ahad · 9:00 pagi', place: 'SIB Pekan Ranau, Sabah', join: 'Jadi sebahagian SIBPR', view: 'Lihat jadual ibadah',
    wanita: { title: 'Pelayanan Wanita', description: 'Sebuah ruang untuk wanita membina persahabatan, saling mendoakan dan bertumbuh dalam iman.', gatherText: 'Kenali wanita lain dalam komuniti gereja dan saling menyokong dalam perjalanan hidup.', serveText: 'Bawa kepedulian, doa dan bakat anda untuk menguatkan komuniti.', number: '01' },
    wira: { title: 'Pelayanan Wira', description: 'Sebuah ruang untuk lelaki saling menyokong, mendalami iman dan melayani bersama.', gatherText: 'Bina persahabatan yang jujur dan saling menguatkan sebagai lelaki beriman.', serveText: 'Cari peluang untuk membantu gereja dan komuniti dengan kemampuan anda.', number: '02' },
    'muda-mudi': { title: 'Pelayanan Muda Mudi', description: 'Sebuah ruang untuk generasi muda membina persahabatan, meneroka iman dan menemukan tujuan.', gatherText: 'Bertemu rakan sebaya, bertanya soalan dan belajar tentang iman bersama.', serveText: 'Terokai bakat anda dan ambil bahagian dalam kehidupan gereja.', number: '03' }
  },
  en: {
    back: 'Back to home', tag: 'SIB PEKAN RANAU MINISTRY', intro: 'A place to get to know one another, grow in faith, and serve together.',
    invite: 'You are welcome here', inviteText: 'Interested in this ministry? Join us for Sunday worship and get to know the SIB Pekan Ranau community.',
    gather: 'Grow together', gatherText: 'Share your faith journey and encourage one another.',
    serve: 'Serve together', serveText: 'Find ways to use your time and gifts for the community.',
    sunday: 'Start with Sunday worship', time: 'Every Sunday · 9:00 AM', place: 'SIB Pekan Ranau, Sabah', join: 'Join the SIBPR family', view: 'View service schedule',
    wanita: { title: "Women's Ministry", description: 'A space for women to build friendships, pray for one another, and grow in faith.', gatherText: 'Meet other women in the church community and support one another through life.', serveText: 'Bring your care, prayers, and gifts to strengthen the community.', number: '01' },
    wira: { title: "Men's Ministry", description: 'A space for men to support one another, deepen their faith, and serve together.', gatherText: 'Build honest friendships and encourage one another as men of faith.', serveText: 'Find ways to help the church and community with your skills.', number: '02' },
    'muda-mudi': { title: 'Youth Ministry', description: 'A space for young people to build friendships, explore faith, and find purpose.', gatherText: 'Meet peers, ask questions, and learn about faith together.', serveText: 'Explore your gifts and take part in the life of the church.', number: '03' }
  }
}
export function MinistryPage({ ministry, lang, onBack, onJoin, onSchedule }: { ministry: MinistryKey; lang: Lang; onBack: () => void; onJoin: () => void; onSchedule: () => void }) {
  const t = content[lang]
  const item = t[ministry]
  return <div className={`ministry-page ministry-page-${ministry}`}>
    <section className="ministry-page-hero">
      <div className="container ministry-page-inner">
        <button className="ministry-back" onClick={onBack}><ArrowLeft size={17}/>{t.back}</button>
        <div className="ministry-page-intro"><span className="eyebrow light">{t.tag} / {item.number}</span><h1>{item.title}</h1><p>{item.description}</p><button className="btn btn-gold" onClick={onJoin}>{t.join}<ArrowRight size={18}/></button></div>
      </div>
    </section>
    <section className="ministry-page-body"><div className="container">
      <div className="ministry-page-lead"><span className="eyebrow"><span className="eyebrow-line"/>{item.number} / SIBPR</span><h2>{t.invite}</h2><p>{t.inviteText}</p></div>
      <div className="ministry-page-features"><article><span><Users size={24}/></span><h3>{t.gather}</h3><p>{item.gatherText}</p></article><article><span><Heart size={24}/></span><h3>{t.serve}</h3><p>{item.serveText}</p></article></div>
    </div></section>
    <section className="ministry-page-visit"><div className="container ministry-page-visit-inner"><div><span className="eyebrow light">SIB PEKAN RANAU</span><h2>{t.sunday}</h2><p><CalendarDays size={18}/>{t.time}</p><p><MapPin size={18}/>{t.place}</p></div><button className="btn btn-gold" onClick={onSchedule}>{t.view}<ArrowRight size={18}/></button></div></section>
  </div>
}
