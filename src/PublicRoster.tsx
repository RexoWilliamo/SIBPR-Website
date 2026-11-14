type Person = { id: string; name: string; photo: string; role: string }
type Roster = { musicians: Person[]; worshipLeader: Person | null; singers: Person[]; multimedia: Person[] }

export function PublicRoster({ roster, legacyLeaders = [], lang }: { roster?: Roster | null; legacyLeaders?: string[]; lang: 'bm' | 'en' }) {
  const unassigned = lang === 'bm' ? 'Belum ditetapkan' : 'To be assigned'
  const legacySingers: Person[] = legacyLeaders.map((name, index) => ({ id: `legacy-${index}`, name, photo: '', role: '' }))
  const groups = [
    { title: lang === 'bm' ? 'Pemimpin pujian' : 'Worship Leader', people: roster?.worshipLeader ? [roster.worshipLeader] : [] },
    { title: lang === 'bm' ? 'Penyanyi sokongan' : 'Backup Singers', people: roster ? roster.singers : legacySingers },
    ...(roster ? [{ title: lang === 'bm' ? 'Pemuzik' : 'Musicians', people: roster.musicians }] : []),
    ...(roster ? [{ title: lang === 'bm' ? 'Multimedia & sistem PA' : 'Live Multimedia & PA System', people: roster.multimedia }] : []),
  ]
  return <div className="public-roster">{groups.map(group => <section className="public-roster-group" key={group.title}><h4>{group.title}</h4>{group.people.length ? group.people.map(person => <div className="public-roster-person" key={person.id}>{person.photo ? <img src={person.photo} alt=""/> : <span className="roster-avatar">{person.name.slice(0, 1)}</span>}<span>{person.name}{person.role && <small>{person.role}</small>}</span></div>) : <p>{unassigned}</p>}</section>)}</div>
}
