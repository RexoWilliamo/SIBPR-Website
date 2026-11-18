export function MainpageVideo({ src, className = '', label }: { src?: string; className?: string; label: string }) {
  if (!src) return null
  return <video className={`mainpage-video ${className}`} src={src} controls playsInline preload="metadata" aria-label={label}/>
}
