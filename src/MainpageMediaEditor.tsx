import { useEffect, useState } from 'react'
import { ImagePlus, RotateCcw } from 'lucide-react'
import { mainpageMedia, type MediaOverrides, type MediaSlot } from './mainpageMedia'

type PendingFile = { file: File; url: string }

export function MainpageMediaEditor({ lang, token }: { lang: 'bm' | 'en'; token: string }) {
  const [overrides, setOverrides] = useState<MediaOverrides>({})
  const [pending, setPending] = useState<Partial<Record<MediaSlot, PendingFile>>>({})
  const [busySlot, setBusySlot] = useState<MediaSlot | null>(null)
  const [message, setMessage] = useState('')
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/mainpage/media', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error(`Media API returned ${response.status}`)
        return response.json() as Promise<MediaOverrides>
      })
      .then(data => { if (active) setOverrides(data) })
      .catch(() => { if (active) setLoadFailed(true) })
    return () => { active = false }
  }, [])

  function clearPending(slot: MediaSlot) {
    setPending(current => {
      const selected = current[slot]
      if (selected) URL.revokeObjectURL(selected.url)
      const next = { ...current }
      delete next[slot]
      return next
    })
  }

  function selectFile(slot: MediaSlot, file?: File) {
    if (!file) return
    const entry = mainpageMedia.find(item => item.slot === slot)!
    const valid = entry.kind === 'video' ? ['video/mp4', 'video/webm'].includes(file.type) : ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    const limit = entry.kind === 'video' ? 30 : 8
    if (!valid || !file.size || file.size > limit * 1024 * 1024) {
      setMessage(lang === 'bm' ? `Pilih fail ${entry.kind === 'video' ? 'MP4/WebM' : 'JPG/PNG/WebP'} di bawah ${limit} MB.` : `Choose a ${entry.kind === 'video' ? 'MP4/WebM' : 'JPG/PNG/WebP'} file under ${limit} MB.`)
      return
    }
    setPending(current => {
      if (current[slot]) URL.revokeObjectURL(current[slot].url)
      return { ...current, [slot]: { file, url: URL.createObjectURL(file) } }
    })
    setMessage(lang === 'bm' ? 'Pratonton sedia. Tekan Terbitkan untuk kemas kini laman utama.' : 'Preview ready. Select Publish to update the Mainpage.')
  }

  async function publish(slot: MediaSlot) {
    const selected = pending[slot]
    if (!selected) return
    setBusySlot(slot)
    setMessage('')
    try {
      const response = await fetch(`/api/management/mainpage/media/${slot}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': selected.file.type },
        body: selected.file,
      })
      const data = await response.json() as { url?: string; error?: string }
      if (!response.ok || !data.url) throw new Error(data.error || `Publish failed (${response.status})`)
      setOverrides(current => ({ ...current, [slot]: data.url }))
      clearPending(slot)
      setMessage(lang === 'bm' ? 'Media berjaya diterbitkan. Muat semula laman utama untuk melihatnya.' : 'Media published. Refresh the Mainpage to see it.')
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setBusySlot(null)
    }
  }

  async function restore(slot: MediaSlot) {
    setBusySlot(slot)
    setMessage('')
    try {
      const response = await fetch(`/api/management/mainpage/media/${slot}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) throw new Error((await response.json()).error || 'Could not restore media')
      setOverrides(current => { const next = { ...current }; delete next[slot]; return next })
      clearPending(slot)
      setMessage(lang === 'bm' ? 'Media asal dipulihkan.' : 'Original media restored.')
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setBusySlot(null)
    }
  }

  return <section className="management-media">
    <div className="management-view-intro"><div>
      <span>{lang === 'bm' ? 'MEDIA LAMAN UTAMA' : 'MAINPAGE MEDIA'}</span>
      <strong>{lang === 'bm' ? 'Gambar & video' : 'Photos & videos'}</strong>
      <p>{lang === 'bm' ? 'Pilih fail, semak pratonton, kemudian tekan Terbitkan. Media asal akan kekal sehingga anda menerbitkan pengganti.' : 'Choose a file, check its preview, then select Publish. The bundled media stays visible until you publish a replacement.'}</p>
    </div></div>
    {loadFailed && <p className="management-status" role="alert">{lang === 'bm' ? 'Tidak dapat memuatkan media. Pastikan pelayan API dan MongoDB sedang berjalan, kemudian muat semula halaman.' : 'Could not load media. Check that the API and MongoDB are running, then refresh this page.'}</p>}
    <div className="management-media-grid">{mainpageMedia.map(entry => {
      const selected = pending[entry.slot]
      const url = selected?.url || overrides[entry.slot] || entry.defaultUrl
      const busy = busySlot === entry.slot
      return <article className="management-media-card" key={entry.slot}>
        <div className="management-media-preview">{url ? entry.kind === 'video' ? <video src={url} controls muted playsInline preload="metadata"/> : <img src={url} alt=""/> : <span>{lang === 'bm' ? 'Tiada media' : 'No media yet'}</span>}</div>
        <div className="management-media-card-body">
          <small>{entry.section}</small><h3>{entry[lang]}</h3>
          <p>{selected ? (lang === 'bm' ? 'Pratonton sahaja, belum diterbitkan' : 'Preview only, not published') : overrides[entry.slot] ? (lang === 'bm' ? 'Media diterbitkan' : 'Published media') : entry.defaultUrl ? (lang === 'bm' ? 'Media asal, belum diganti' : 'Bundled media, no replacement published') : (lang === 'bm' ? 'Belum ada media diterbitkan' : 'No media published yet')}</p>
          <div className="management-media-actions">
            <label className="management-media-upload"><ImagePlus size={17}/>{lang === 'bm' ? 'Pilih fail' : 'Choose file'}<input type="file" accept={entry.kind === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'} disabled={Boolean(busySlot)} onChange={event => { selectFile(entry.slot, event.target.files?.[0]); event.target.value = '' }}/></label>
            {selected && <><button type="button" className="management-media-publish" disabled={Boolean(busySlot)} onClick={() => void publish(entry.slot)}>{busy ? (lang === 'bm' ? 'Menerbitkan…' : 'Publishing…') : (lang === 'bm' ? 'Terbitkan' : 'Publish')}</button><button type="button" disabled={Boolean(busySlot)} onClick={() => clearPending(entry.slot)}>{lang === 'bm' ? 'Batal' : 'Cancel'}</button></>}
            {overrides[entry.slot] && <button type="button" disabled={Boolean(busySlot)} onClick={() => void restore(entry.slot)}><RotateCcw size={16}/>{lang === 'bm' ? 'Pulih asal' : 'Restore original'}</button>}
          </div>
        </div>
      </article>
    })}</div>
    {message && <p className="management-status" role="status">{message}</p>}
  </section>
}
