import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

export type HeroSlide = { src: string; poster: string; label: { bm: string; en: string } }
export function HeroCarousel({ slides, lang }: { slides: HeroSlide[]; lang: 'bm' | 'en' }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [visible, setVisible] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const slide = slides[index]
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 })
    if (shellRef.current) observer.observe(shellRef.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!playing || !visible || slides.length < 2) return
    const timer = window.setTimeout(() => setIndex(current => (current + 1) % slides.length), 8500)
    return () => window.clearTimeout(timer)
  }, [index, playing, visible, slides.length])
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (playing && visible) video.play().catch(() => setPlaying(false))
    else video.pause()
  }, [index, playing, visible])
  function step(direction: number) { setIndex(current => (current + direction + slides.length) % slides.length) }
  return <div className="hero-media" ref={shellRef} aria-label={lang === 'bm' ? 'Sorotan video SIB Pekan Ranau' : 'SIB Pekan Ranau video highlights'}>
    <div className="hero-media-frame" key={slide.src}>
      <video ref={videoRef} src={slide.src} poster={slide.poster} autoPlay={playing} muted playsInline loop preload="metadata" aria-label={slide.label[lang]}/>
      <div className="hero-media-caption"><span>{lang === 'bm' ? 'SEKILAS SIBPR' : 'SIBPR MOMENTS'}</span><strong>{slide.label[lang]}</strong></div>
    </div>
    {slides.length > 1 && <div className="hero-media-controls"><div className="hero-media-dots">{slides.map((item, n) => <button key={item.src} className={n === index ? 'active' : ''} onClick={() => setIndex(n)} aria-label={`${lang === 'bm' ? 'Video' : 'Video'} ${n + 1}`} aria-current={n === index ? 'true' : undefined}/>)}</div><div className="hero-media-buttons"><button onClick={() => step(-1)} aria-label={lang === 'bm' ? 'Video sebelumnya' : 'Previous video'}><ChevronLeft size={19}/></button><button onClick={() => setPlaying(value => !value)} aria-label={playing ? (lang === 'bm' ? 'Jeda video' : 'Pause video') : (lang === 'bm' ? 'Mainkan video' : 'Play video')}>{playing ? <Pause size={17}/> : <Play size={17}/>}</button><button onClick={() => step(1)} aria-label={lang === 'bm' ? 'Video seterusnya' : 'Next video'}><ChevronRight size={19}/></button></div></div>}
  </div>
}
