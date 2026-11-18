import { useEffect, useState, type FormEvent } from 'react'
import { Camera, Check, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { RosterDragBoard } from './RosterDragBoard'

export type Person = { id: string; name: string; category: 'musician' | 'worship' | 'multimedia'; instrument: string; talent: string; photo: string }
export type Selection = { drummer: string | null; bassist: string | null; guitarists: string[]; keyboardists: string[]; worshipLeader: string | null; singers: string[]; multimedia: string[] }
export const emptySelection = (): Selection => ({ drummer: null, bassist: null, guitarists: [], keyboardists: [], worshipLeader: null, singers: [], multimedia: [] })
type Service = { id: string | null; date: string; theme: string; scripture: string; notes: string; selection?: Selection | null }
type Group = Person['category']
const groups: Group[] = ['musician', 'worship', 'multimedia']
const instruments = ['drums', 'bass', 'guitar', 'keyboard']
const labels = {
  en: { title: 'Serving teams', intro: 'Choose a team, maintain its people, and assign the serving team for this date.', musician: 'Musicians', worship: 'Worship leader & singers', multimedia: 'Live Multimedia & PA system', addEdit: 'Add / Edit people', addPerson: 'Add new person', savePerson: 'Save person', name: 'Name', instrument: 'Instrument', talent: 'Talent / responsibility', photo: 'Picture', remove: 'Remove', cancel: 'Cancel', choose: 'Choose a person', drummer: 'Drummer · 1', bassist: 'Bassist · 1', guitarists: 'Guitarists · up to 2', keyboardists: 'Keyboard / piano · up to 2', worshipLeader: 'Worship leader · 1', singers: 'Backup singers · up to 10', multimediaPeople: 'People in charge', preview: 'Overall preview', publish: 'Save schedule', publishing: 'Publishing…', empty: 'No people added to this team yet.', noSelection: 'Not assigned', saved: 'Schedule saved.', missingLeader: 'Choose a worship leader before backup singers.', photoTooLarge: 'Choose a JPEG, PNG, or WebP picture under 300 KB.', deletePerson: 'Remove this person from the directory?', list: 'People in this team', addHelp: 'Add people first, then choose who will serve this date.', current: 'Serving this date', details: 'Service details', back: 'Back to teams' },
  bm: { title: 'Pasukan pelayanan', intro: 'Pilih pasukan, urus senarai orang, dan tetapkan petugas untuk tarikh ini.', musician: 'Pemuzik', worship: 'Pemimpin pujian & penyanyi', multimedia: 'Multimedia langsung & sistem PA', addEdit: 'Tambah / Sunting orang', addPerson: 'Tambah orang baharu', savePerson: 'Simpan orang', name: 'Nama', instrument: 'Alat muzik', talent: 'Kemahiran / tanggungjawab', photo: 'Gambar', remove: 'Padam', cancel: 'Batal', choose: 'Pilih orang', drummer: 'Pemain dram · 1', bassist: 'Pemain bes · 1', guitarists: 'Pemain gitar · hingga 2', keyboardists: 'Pemain papan nada / piano · hingga 2', worshipLeader: 'Pemimpin pujian · 1', singers: 'Penyanyi sokongan · hingga 10', multimediaPeople: 'Petugas', preview: 'Pratonton keseluruhan', publish: 'Simpan jadual', publishing: 'Menyimpan…', empty: 'Belum ada orang dalam pasukan ini.', noSelection: 'Belum ditetapkan', saved: 'Jadual disimpan.', missingLeader: 'Pilih pemimpin pujian sebelum penyanyi sokongan.', photoTooLarge: 'Pilih gambar JPEG, PNG, atau WebP di bawah 300 KB.', deletePerson: 'Padam orang ini daripada senarai?', list: 'Senarai pasukan', addHelp: 'Tambah orang dahulu, kemudian pilih petugas tarikh ini.', current: 'Bertugas pada tarikh ini', details: 'Butiran ibadah', back: 'Kembali ke pasukan' },
}

export function SundayRosterEditor({ lang, token, service, date, busy, onPublish, onError }: { lang: 'bm' | 'en'; token: string; service: Service; date: string; busy: boolean; onPublish: (selection: Selection) => Promise<void>; onError: (message: string) => void }) {
  const t = labels[lang]
  const [group, setGroup] = useState<Group>('musician')
  const [people, setPeople] = useState<Person[]>([])
  const [selection, setSelection] = useState<Selection>(emptySelection)
  const [editing, setEditing] = useState(false)
  const [person, setPerson] = useState<Person>({ id: '', name: '', category: 'musician', instrument: 'drums', talent: '', photo: '' })
  const [preview, setPreview] = useState(false)
  const [working, setWorking] = useState(false)

  async function loadPeople() {
    const response = await fetch('/api/management/people', { headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) throw Error('Could not load the people directory.')
    setPeople(await response.json())
  }
  useEffect(() => { loadPeople().catch(error => onError(error.message)) }, [token])
  useEffect(() => { setSelection(service.selection || emptySelection()) }, [service.id, service.date, service.selection])
  const listed = people.filter(item => item.category === group)
  const byId = (id: string | null) => people.find(item => item.id === id)
  const describe = (id: string) => { const item = byId(id); return item ? `${item.name}${item.instrument ? ` · ${item.instrument}` : item.talent ? ` · ${item.talent}` : ''}` : t.noSelection }
  function startNew() { setPerson({ id: '', name: '', category: group, instrument: 'drums', talent: '', photo: '' }); setEditing(true) }
  function startEdit(item: Person) { setPerson(item); setEditing(true) }
  async function uploadPhoto(file?: File) {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 300000) { onError(t.photoTooLarge); return }
    const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file) })
    setPerson(current => ({ ...current, photo: data }))
  }
  async function savePerson(event: FormEvent) {
    event.preventDefault(); setWorking(true)
    try {
      const response = await fetch(person.id ? `/api/management/people/${person.id}` : '/api/management/people', { method: person.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: person.name, category: person.category, instrument: person.instrument, talent: person.talent, photo: person.photo }) })
      if (!response.ok) throw Error((await response.json()).error || 'Could not save person')
      await loadPeople(); setEditing(false)
    } catch (error) { onError((error as Error).message) } finally { setWorking(false) }
  }
  async function deletePerson(item: Person) {
    if (!window.confirm(t.deletePerson)) return
    setWorking(true)
    try { const response = await fetch(`/api/management/people/${item.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) throw Error('Could not remove person'); await loadPeople(); setSelection(current => ({ ...current, drummer: current.drummer === item.id ? null : current.drummer, bassist: current.bassist === item.id ? null : current.bassist, guitarists: current.guitarists.filter(id => id !== item.id), keyboardists: current.keyboardists.filter(id => id !== item.id), worshipLeader: current.worshipLeader === item.id ? null : current.worshipLeader, singers: current.singers.filter(id => id !== item.id), multimedia: current.multimedia.filter(id => id !== item.id) })) } catch (error) { onError((error as Error).message) } finally { setWorking(false) }
  }
  const previewGroups = [{ title: t.musician, ids: [selection.drummer, selection.bassist, ...selection.guitarists, ...selection.keyboardists].filter((x): x is string => Boolean(x)) }, { title: t.worship, ids: [selection.worshipLeader, ...selection.singers].filter((x): x is string => Boolean(x)) }, { title: t.multimedia, ids: selection.multimedia }]

  return <div className="roster-editor"><div className="roster-title"><h2>{t.title}</h2><p>{t.intro}</p></div><div className="roster-tabs" role="tablist" aria-label={t.title}>{groups.map((item, index) => <button key={item} type="button" role="tab" aria-selected={!preview && group === item} className={!preview && group === item ? 'active' : ''} onClick={() => { setGroup(item); setPreview(false); setEditing(false) }}><span className="roster-tab-number">{String(index + 1).padStart(2, '0')}</span>{t[item]}</button>)}<button type="button" role="tab" aria-selected={preview} className={preview ? 'active' : ''} onClick={() => { setPreview(true); setEditing(false) }}><span className="roster-tab-number">04</span>{t.preview}</button></div>
    {!preview ? <><div className="roster-panel"><div className="roster-panel-head"><div><h3>{t[group]}</h3><p>{t.addHelp}</p></div><button type="button" className="roster-outline" onClick={() => setEditing(!editing)}><Pencil size={16}/>{t.addEdit}</button></div>{editing ? <><div className="roster-directory"><h4>{t.list}</h4>{listed.length ? listed.map(item => <div className="roster-person" key={item.id}>{item.photo ? <img src={item.photo} alt=""/> : <span className="roster-avatar">{item.name.slice(0, 1)}</span>}<div><strong>{item.name}</strong><small>{item.instrument || item.talent}</small></div><button type="button" onClick={() => startEdit(item)} aria-label={`Edit ${item.name}`}><Pencil size={16}/></button><button type="button" onClick={() => deletePerson(item)} aria-label={`Remove ${item.name}`}><Trash2 size={16}/></button></div>) : <p>{t.empty}</p>}<button type="button" className="roster-outline" onClick={startNew}><Plus size={16}/>{t.addPerson}</button></div><form className="roster-person-form" onSubmit={savePerson}><h4>{person.id ? t.addEdit : t.addPerson}</h4><label>{t.name}<input required maxLength={80} value={person.name} onChange={event => setPerson(current => ({ ...current, name: event.target.value }))}/></label>{group === 'musician' && <label>{t.instrument}<select value={person.instrument} onChange={event => setPerson(current => ({ ...current, instrument: event.target.value }))}>{instruments.map(item => <option key={item} value={item}>{item}</option>)}</select></label>}{group === 'multimedia' && <label>{t.talent}<input maxLength={80} value={person.talent} onChange={event => setPerson(current => ({ ...current, talent: event.target.value }))}/></label>}<label className="roster-photo-input"><Camera size={18}/>{t.photo}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => uploadPhoto(event.target.files?.[0]).catch(error => onError(error.message))}/></label>{person.photo && <img className="roster-photo-preview" src={person.photo} alt={person.name}/>}<div className="roster-form-actions"><button className="btn btn-gold" disabled={working}>{t.savePerson}</button><button type="button" className="roster-outline" onClick={() => setEditing(false)}>{t.cancel}</button></div></form></> : <RosterDragBoard group={group} people={people} selection={selection} setSelection={setSelection} lang={lang} onError={onError}/>}</div><button type="button" className="roster-next btn btn-gold" onClick={() => setPreview(true)}>{t.preview}</button></> : <div className="roster-panel roster-preview"><h3>{t.preview}</h3><p><strong>{date}</strong>{service.theme ? ` · ${service.theme}` : ''}{service.scripture ? ` · ${service.scripture}` : ''}</p>{previewGroups.map(group => <section key={group.title}><h4>{group.title}</h4>{group.ids.length ? group.ids.map(id => <div className="roster-person" key={id}>{byId(id)?.photo ? <img src={byId(id)?.photo} alt=""/> : <span className="roster-avatar">{byId(id)?.name.slice(0, 1)}</span>}<span>{describe(id)}</span><Check size={16}/></div>) : <p>{t.noSelection}</p>}</section>)}<div className="roster-form-actions"><button type="button" className="btn btn-gold" disabled={busy || !date} onClick={() => { if (selection.singers.length && !selection.worshipLeader) { onError(t.missingLeader); return } onPublish(selection) }}><Save size={16}/>{busy ? t.publishing : t.publish}</button><button type="button" className="roster-outline" onClick={() => setPreview(false)}>{t.back}</button></div></div>}
  </div>
}
