import { useState, type Dispatch, type SetStateAction } from 'react'
import { GripVertical, Plus, X } from 'lucide-react'
import type { Person, Selection } from './SundayRosterEditor'

type Group = Person['category']
type SingleRole = 'drummer' | 'bassist' | 'worshipLeader'
type ListRole = 'guitarists' | 'keyboardists' | 'singers' | 'multimedia'
type Role = SingleRole | ListRole
const isList = (role: Role): role is ListRole => ['guitarists', 'keyboardists', 'singers', 'multimedia'].includes(role)
const maxFor: Record<ListRole, number> = { guitarists: 2, keyboardists: 2, singers: 10, multimedia: 30 }
const instrumentFor: Partial<Record<Role, string>> = { drummer: 'drums', bassist: 'bass', guitarists: 'guitar', keyboardists: 'keyboard' }

export function RosterDragBoard({ group, people, selection, setSelection, lang, onError }: { group: Group; people: Person[]; selection: Selection; setSelection: Dispatch<SetStateAction<Selection>>; lang: 'bm' | 'en'; onError: (message: string) => void }) {
  const [pickedId, setPickedId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overSlot, setOverSlot] = useState<string | null>(null)
  const listed = people.filter(person => person.category === group)
  const byId = (id: string | null) => people.find(person => person.id === id)
  const assignedIds = [selection.drummer, selection.bassist, ...selection.guitarists, ...selection.keyboardists, selection.worshipLeader, ...selection.singers, ...selection.multimedia]
  const copy = lang === 'bm' ? {
    available: 'Senarai orang', serving: 'Bertugas minggu ini', hint: 'Seret nama ke peranan di kanan. Pada telefon, ketik nama kemudian ketik peranan.', drop: 'Lepaskan atau ketik di sini', choose: 'Pilih nama di kiri', empty: 'Belum ada orang. Gunakan Tambah / Sunting orang.', assigned: 'Ditugaskan', invalid: 'Orang ini tidak sesuai untuk peranan tersebut.', leaderFirst: 'Pilih pemimpin pujian sebelum penyanyi sokongan.', full: 'Peranan ini sudah penuh.', drums: 'Pemain dram', bass: 'Pemain bes', guitar: 'Pemain gitar', keyboard: 'Piano / papan nada', leader: 'Pemimpin pujian', singers: 'Penyanyi sokongan', multimedia: 'Multimedia & PA', addSinger: 'Tambah penyanyi', addMultimedia: 'Tambah petugas', remove: 'Keluarkan' 
  } : {
    available: 'People list', serving: 'This week’s service', hint: 'Drag a name into a role on the right. On a phone, tap a name and then tap a role.', drop: 'Drop or tap here', choose: 'Choose a name on the left', empty: 'No people yet. Use Add / Edit people.', assigned: 'Assigned', invalid: 'This person does not match that role.', leaderFirst: 'Choose a worship leader before backup singers.', full: 'This role is full.', drums: 'Drummer', bass: 'Bassist', guitar: 'Guitarist', keyboard: 'Keyboard / piano', leader: 'Worship leader', singers: 'Backup singers', multimedia: 'Multimedia & PA', addSinger: 'Add backup singer', addMultimedia: 'Add person in charge', remove: 'Remove' 
  }

  function removeEverywhere(current: Selection, id: string): Selection {
    return { drummer: current.drummer === id ? null : current.drummer, bassist: current.bassist === id ? null : current.bassist, guitarists: current.guitarists.filter(item => item !== id), keyboardists: current.keyboardists.filter(item => item !== id), worshipLeader: current.worshipLeader === id ? null : current.worshipLeader, singers: current.singers.filter(item => item !== id), multimedia: current.multimedia.filter(item => item !== id) }
  }
  function assign(id: string | null, role: Role, index?: number) {
    if (!id) { onError(copy.choose); return }
    const person = byId(id)
    const category = role === 'worshipLeader' || role === 'singers' ? 'worship' : role === 'multimedia' ? 'multimedia' : 'musician'
    if (!person || person.category !== category || (instrumentFor[role] && person.instrument !== instrumentFor[role])) { onError(copy.invalid); return }
    if (role === 'singers' && !selection.worshipLeader) { onError(copy.leaderFirst); return }
    if (isList(role) && index === undefined && selection[role].length >= maxFor[role] && !selection[role].includes(id)) { onError(copy.full); return }
    setSelection(current => {
      if (isList(role) && index !== undefined) {
        const oldIndex = current[role].indexOf(id)
        if (oldIndex === index) return current
        if (oldIndex >= 0 && index < current[role].length) {
          const swapped = [...current[role]]
          ;[swapped[oldIndex], swapped[index]] = [swapped[index], swapped[oldIndex]]
          return { ...current, [role]: swapped }
        }
      }
      const next = removeEverywhere(current, id)
      if (!isList(role)) {
        next[role] = id
        if (role === 'worshipLeader') next.singers = next.singers.filter(item => item !== id)
      } else {
        const items = [...next[role]]
        if (index === undefined || index >= items.length) items.push(id)
        else items.splice(index, 1, id)
        next[role] = items.slice(0, maxFor[role])
      }
      return next
    })
    setPickedId(null); setDraggingId(null); setOverSlot(null)
  }
  function remove(role: Role, index?: number) {
    setSelection(current => {
      if (!isList(role)) return { ...current, [role]: null, ...(role === 'worshipLeader' ? { singers: [] } : {}) }
      return { ...current, [role]: current[role].filter((_, i) => i !== index) }
    })
  }
  function slot(role: Role, title: string, index?: number) {
    const id = isList(role) ? (index === undefined ? null : selection[role][index] || null) : selection[role]
    const person = byId(id)
    const slotId = `${role}-${index ?? 'new'}`
    const active = overSlot === slotId
    return <div className={`roster-drop-slot${active ? ' over' : ''}`} key={slotId} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setOverSlot(slotId) }} onDragLeave={() => setOverSlot(current => current === slotId ? null : current)} onDrop={event => { event.preventDefault(); assign(event.dataTransfer.getData('text/plain') || draggingId, role, index) }}>
      <button type="button" className="roster-drop-target" onClick={() => assign(pickedId, role, index)} aria-label={`${title}: ${person?.name || copy.drop}`}><span className="roster-drop-role">{title}</span><span className="roster-drop-person">{person ? <>{person.photo ? <img src={person.photo} alt=""/> : <span className="roster-avatar">{person.name.slice(0, 1)}</span>}<strong>{person.name}</strong></> : <><Plus size={16}/><span>{pickedId ? copy.drop : copy.choose}</span></>}</span></button>
      {id && <button type="button" className="roster-drop-remove" onClick={() => remove(role, index)} aria-label={`${copy.remove} ${person?.name || ''}`}><X size={16}/></button>}
    </div>
  }
  function expandable(role: ListRole, title: string, addTitle: string) {
    const items = selection[role]
    return <section className="roster-role-group"><div className="roster-role-heading"><h5>{title}</h5><span>{items.length} / {maxFor[role]}</span></div>{items.map((_, index) => slot(role, `${title} ${index + 1}`, index))}{items.length < maxFor[role] && slot(role, addTitle)}</section>
  }

  return <div className="roster-drag-board"><p className="roster-drag-hint">{copy.hint}</p><div className="roster-drag-columns"><section className="roster-available"><div className="roster-board-heading"><h4>{copy.available}</h4><span>{listed.length}</span></div>{listed.length ? <div className="roster-available-list">{listed.map(person => <button type="button" key={person.id} draggable onDragStart={event => { event.dataTransfer.setData('text/plain', person.id); event.dataTransfer.effectAllowed = 'move'; setDraggingId(person.id) }} onDragEnd={() => { setDraggingId(null); setOverSlot(null) }} onClick={() => setPickedId(current => current === person.id ? null : person.id)} className={`roster-source${pickedId === person.id ? ' picked' : ''}`} aria-pressed={pickedId === person.id}>{person.photo ? <img src={person.photo} alt=""/> : <span className="roster-avatar">{person.name.slice(0, 1)}</span>}<span className="roster-source-text"><strong>{person.name}</strong><small>{person.instrument || person.talent || (group === 'worship' ? copy.singers : copy.multimedia)}</small></span>{assignedIds.includes(person.id) ? <span className="roster-source-assigned">{copy.assigned}</span> : <GripVertical size={17}/>}</button>)}</div> : <p className="roster-board-empty">{copy.empty}</p>}</section><section className="roster-serving"><div className="roster-board-heading"><h4>{copy.serving}</h4><span>{assignedIds.filter(id => id && listed.some(person => person.id === id)).length}</span></div><div className="roster-serving-roles">{group === 'musician' ? <>{slot('drummer', copy.drums)}{slot('bassist', copy.bass)}<section className="roster-role-group"><div className="roster-role-heading"><h5>{copy.guitar}</h5><span>{selection.guitarists.length} / 2</span></div>{slot('guitarists', `${copy.guitar} 1`, 0)}{slot('guitarists', `${copy.guitar} 2`, 1)}</section><section className="roster-role-group"><div className="roster-role-heading"><h5>{copy.keyboard}</h5><span>{selection.keyboardists.length} / 2</span></div>{slot('keyboardists', `${copy.keyboard} 1`, 0)}{slot('keyboardists', `${copy.keyboard} 2`, 1)}</section></> : group === 'worship' ? <>{slot('worshipLeader', copy.leader)}{expandable('singers', copy.singers, copy.addSinger)}</> : expandable('multimedia', copy.multimedia, copy.addMultimedia)}</div></section></div></div>
}
