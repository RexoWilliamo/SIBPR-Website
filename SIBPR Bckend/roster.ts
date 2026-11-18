import type { FastifyInstance } from 'fastify'
import { ObjectId, type Db } from 'mongodb'

type Category = 'musician' | 'worship' | 'multimedia'
type Instrument = 'drums' | 'bass' | 'guitar' | 'keyboard'
type Person = { _id: ObjectId; name: string; category: Category; instrument?: Instrument; talent?: string; photo: string }
type Selection = { drummer: string | null; bassist: string | null; guitarists: string[]; keyboardists: string[]; worshipLeader: string | null; singers: string[]; multimedia: string[] }
const instruments = ['drums', 'bass', 'guitar', 'keyboard']
const categories = ['musician', 'worship', 'multimedia']
const imagePattern = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/
const publicPerson = (person: Person, role: string) => ({ id: person._id.toString(), name: person.name, photo: person.photo || '', role })
const serializePerson = (person: Person) => ({ id: person._id.toString(), name: person.name, category: person.category, instrument: person.instrument || '', talent: person.talent || '', photo: person.photo || '' })

export function registerRoster(app: FastifyInstance, db: Db, editor: (request: any, reply: any) => Promise<unknown>) {
  const people = db.collection<Person>('people')
  const services = db.collection('services')

  app.get('/api/management/people', { preHandler: editor }, async () => (await people.find({}).sort({ name: 1 }).toArray()).map(serializePerson))

  app.post('/api/management/people', { preHandler: editor }, async (request, reply) => {
    const body = request.body as Partial<Omit<Person, '_id'>>
    const person = validatePerson(body)
    if (!person) return reply.code(400).send({ error: 'Enter a valid name, team, role, and image under 300 KB.' })
    const result = await people.insertOne(person as Person)
    return reply.code(201).send(serializePerson({ ...person, _id: result.insertedId } as Person))
  })

  app.put('/api/management/people/:id', { preHandler: editor }, async (request, reply) => {
    const { id } = request.params as { id: string }
    if (!ObjectId.isValid(id)) return reply.code(400).send({ error: 'Invalid person ID' })
    const person = validatePerson(request.body as Partial<Omit<Person, '_id'>>)
    if (!person) return reply.code(400).send({ error: 'Enter a valid name, team, role, and image under 300 KB.' })
    const result = await people.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: person }, { returnDocument: 'after' })
    if (!result) return reply.code(404).send({ error: 'Person not found' })
    return serializePerson(result)
  })

  app.delete('/api/management/people/:id', { preHandler: editor }, async (request, reply) => {
    const { id } = request.params as { id: string }
    if (!ObjectId.isValid(id)) return reply.code(400).send({ error: 'Invalid person ID' })
    const result = await people.deleteOne({ _id: new ObjectId(id) })
    if (!result.deletedCount) return reply.code(404).send({ error: 'Person not found' })
    return reply.code(204).send()
  })

  app.put('/api/management/services/:date/publish', { preHandler: editor }, async (request, reply) => {
    const { date } = request.params as { date: string }
    const parsedDate = new Date(`${date}T00:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date || parsedDate.getUTCDay() !== 0) return reply.code(400).send({ error: 'Choose a Sunday date' })
    const body = request.body as { theme?: unknown; scripture?: unknown; notes?: unknown; selection?: Selection }
    if (typeof body?.theme !== 'string' || body.theme.length > 120 || typeof body.scripture !== 'string' || body.scripture.length > 120 || typeof body.notes !== 'string' || body.notes.length > 1000) return reply.code(400).send({ error: 'Invalid service details' })
    const choice = body.selection
    if (!choice || !Array.isArray(choice.guitarists) || !Array.isArray(choice.keyboardists) || !Array.isArray(choice.singers) || !Array.isArray(choice.multimedia) || choice.guitarists.length > 2 || choice.keyboardists.length > 2 || choice.singers.length > 10 || choice.multimedia.length > 30 || ![choice.drummer, choice.bassist, choice.worshipLeader].every(x => x === null || typeof x === 'string')) return reply.code(400).send({ error: 'Invalid team selection' })
    const allIds = [choice.drummer, choice.bassist, ...choice.guitarists, ...choice.keyboardists, choice.worshipLeader, ...choice.singers, ...choice.multimedia].filter((x): x is string => typeof x === 'string' && x.length > 0)
    if (new Set(allIds).size !== allIds.length || allIds.some(id => !ObjectId.isValid(id))) return reply.code(400).send({ error: 'Select each person only once' })
    const selected = await people.find({ _id: { $in: allIds.map(id => new ObjectId(id)) } }).toArray()
    const byId = new Map(selected.map(person => [person._id.toString(), person]))
    if (selected.length !== allIds.length) return reply.code(400).send({ error: 'A selected person is missing. Refresh the people list.' })
    const valid = (id: string | null, category: Category, instrument?: Instrument) => !id || (byId.get(id)?.category === category && (!instrument || byId.get(id)?.instrument === instrument))
    if (!valid(choice.drummer, 'musician', 'drums') || !valid(choice.bassist, 'musician', 'bass') || !choice.guitarists.every(id => valid(id, 'musician', 'guitar')) || !choice.keyboardists.every(id => valid(id, 'musician', 'keyboard')) || !valid(choice.worshipLeader, 'worship') || !choice.singers.every(id => valid(id, 'worship')) || !choice.multimedia.every(id => valid(id, 'multimedia'))) return reply.code(400).send({ error: 'A selected person has the wrong team or instrument' })
    if (choice.singers.length && !choice.worshipLeader) return reply.code(400).send({ error: 'Choose a worship leader before backup singers' })
    const person = (id: string | null, role: string) => id ? publicPerson(byId.get(id)!, role) : null
    const musicians = [person(choice.drummer, 'Drums'), person(choice.bassist, 'Bass'), ...choice.guitarists.map(id => person(id, 'Guitar')), ...choice.keyboardists.map(id => person(id, 'Keyboard'))].filter(x => x !== null)
    const worshipLeader = person(choice.worshipLeader, 'Worship leader')
    const singers = choice.singers.map(id => person(id, 'Backup singer'))
    const multimedia = choice.multimedia.map(id => person(id, byId.get(id)?.talent || 'Multimedia & PA'))
    const previous = await services.findOne({ date })
    const teams = { praise: musicians.map(x => x.name), ushers: previous?.teams?.ushers || [], leaders: [worshipLeader, ...singers].filter(x => x !== null).map(x => x!.name), multimedia: multimedia.map(x => x!.name) }
    await services.updateOne({ date }, { $set: { date, theme: body.theme.trim(), scripture: body.scripture.trim(), notes: body.notes.trim(), teams, selection: choice, roster: { musicians, worshipLeader, singers, multimedia }, updatedAt: new Date() } }, { upsert: true })
    return { ok: true }
  })
}

function validatePerson(body: Partial<Omit<Person, '_id'>> | null) {
  if (!body || typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 80 || !categories.includes(String(body.category)) || typeof body.photo !== 'string' || (body.photo && (body.photo.length > 410000 || !imagePattern.test(body.photo)))) return null
  if (body.category === 'musician' && !instruments.includes(String(body.instrument))) return null
  if (body.category === 'multimedia' && (typeof body.talent !== 'string' || body.talent.trim().length > 80)) return null
  return { name: body.name.trim(), category: body.category, instrument: body.category === 'musician' ? body.instrument : undefined, talent: body.category === 'multimedia' ? body.talent?.trim() : undefined, photo: body.photo }
}