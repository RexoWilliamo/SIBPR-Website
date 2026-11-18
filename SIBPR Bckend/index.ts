import Fastify from 'fastify'
import { registerRoster } from './roster.js'
import { registerMainpageMedia } from './mainpageMedia.js'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import bcrypt from 'bcryptjs'
import { MongoClient, ObjectId } from 'mongodb'

const app = Fastify({ logger: true })
const port = Number(process.env.API_PORT || 3001)
const mongoUri = process.env.MONGODB_URI
const jwtSecret = process.env.JWT_SECRET
if (!mongoUri || !jwtSecret || jwtSecret.length < 24) throw new Error('Set MONGODB_URI and a JWT_SECRET of at least 24 characters')
const client = new MongoClient(mongoUri)
await client.connect()
const db = client.db(process.env.MONGODB_DB || 'sib_pekan_ranau')
const services = db.collection('services')
const users = db.collection('users')
await services.createIndex({ date: 1 }, { unique: true })
await users.createIndex({ email: 1 }, { unique: true })
await users.createIndex({ username: 1 }, { unique: true, sparse: true })
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const adminUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase()
const adminPassword = process.env.ADMIN_PASSWORD
if (adminEmail && adminPassword && !(await users.findOne({ email: adminEmail }))) {
  await users.insertOne({ email: adminEmail, ...(adminUsername ? { username: adminUsername } : {}), passwordHash: await bcrypt.hash(adminPassword, 12), role: 'admin' })
  app.log.info('Initial admin account created')
}
await app.register(cors, { origin: process.env.WEB_ORIGIN || 'http://localhost:5173' })
await app.register(jwt, { secret: jwtSecret })

type Role = 'admin' | 'staff' | 'service_admin'
type Team = { praise: string[]; ushers: string[]; leaders: string[]; multimedia: string[] }
const emptyTeam: Team = { praise: [], ushers: [], leaders: [], multimedia: [] }
function isValidDate(date: string) { const d = new Date(`${date}T00:00:00Z`); return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date }
function cleanNames(value: unknown): string[] | null { return Array.isArray(value) && value.length <= 30 && value.every(x => typeof x === 'string' && x.length <= 80) ? value.map(x => x.trim()).filter(Boolean) : null }
async function editor(request: any, reply: any) { try { await request.jwtVerify(); if (!['admin', 'staff', 'service_admin'].includes(request.user.role)) throw Error('Forbidden'); if (!(await users.findOne({ _id: new ObjectId(request.user.sub), role: request.user.role }))) throw Error('Forbidden') } catch { return reply.code(401).send({ error: 'Unauthorized' }) } }
function serialize(doc: any) { return { id: doc._id.toString(), date: doc.date, theme: doc.theme || '', scripture: doc.scripture || '', notes: doc.notes || '', teams: { ...emptyTeam, ...doc.teams }, selection: doc.selection || null, roster: doc.roster || null } }

app.get('/api/health', async () => ({ ok: true }))
app.get('/api/services', async (request) => { const { from, limit } = request.query as { from?: string; limit?: string }; const docs = await services.find(from ? { date: { $gte: from } } : {}).sort({ date: 1 }).limit(Math.min(Math.max(Number(limit) || 12, 1), 52)).toArray(); return docs.map(serialize) })
app.get('/api/management/services', { preHandler: editor }, async () => (await services.find({}).sort({ date: -1 }).limit(100).toArray()).map(serialize))
app.get('/api/services/:date', async (request, reply) => { const { date } = request.params as { date: string }; if (!isValidDate(date)) return reply.code(400).send({ error: 'Enter a valid date (YYYY-MM-DD)' }); const doc = await services.findOne({ date }); return doc ? serialize(doc) : { id: null, date, theme: '', scripture: '', notes: '', teams: emptyTeam } })
app.post('/api/auth/login', async (request, reply) => { const { username, password } = (request.body || {}) as { username?: string; password?: string }; if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) return reply.code(400).send({ error: 'Username and password required' }); const identifier = username.trim().toLowerCase(); const user = await users.findOne({ $or: [{ username: identifier }, { email: identifier }] }); if (!user || !(await bcrypt.compare(password, String(user.passwordHash)))) return reply.code(401).send({ error: 'Invalid credentials' }); return { token: app.jwt.sign({ sub: user._id.toString(), role: user.role }, { expiresIn: '8h' }), role: user.role, username: user.username || user.email } })
app.get('/api/auth/me', { preHandler: editor }, async (request: any) => ({ role: request.user.role }))
app.put('/api/services/:date', { preHandler: editor }, async (request, reply) => {
  const { date } = request.params as { date: string }
  if (!isValidDate(date)) return reply.code(400).send({ error: 'Choose a valid date' })
  const body = request.body as { theme?: unknown; scripture?: unknown; notes?: unknown; teams?: Record<string, unknown> }
  const teams = body?.teams
  if (!teams || typeof body.theme !== 'string' || body.theme.length > 120 || typeof body.scripture !== 'string' || body.scripture.length > 120 || typeof body.notes !== 'string' || body.notes.length > 1000) return reply.code(400).send({ error: 'Invalid service details' })
  const praise = cleanNames(teams.praise), ushers = cleanNames(teams.ushers), leaders = cleanNames(teams.leaders), multimedia = cleanNames(teams.multimedia)
  if (!praise || !ushers || !leaders || !multimedia) return reply.code(400).send({ error: 'Invalid team assignments' })
  await services.updateOne({ date }, { $set: { date, theme: body.theme.trim(), scripture: body.scripture.trim(), notes: body.notes.trim(), teams: { praise, ushers, leaders, multimedia }, updatedAt: new Date() } }, { upsert: true })
  return serialize(await services.findOne({ date }))
})
app.delete('/api/services/:date', { preHandler: editor }, async (request, reply) => {
  const { date } = request.params as { date: string }
  if (!isValidDate(date)) return reply.code(400).send({ error: 'Choose a valid date' })
  const result = await services.deleteOne({ date })
  if (!result.deletedCount) return reply.code(404).send({ error: 'Schedule not found' })
  return reply.code(204).send()
})
app.post('/api/admin/staff', { preHandler: editor }, async (request: any, reply) => {
  if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Admin only' })
  const { username, email, password } = (request.body || {}) as { username?: string; email?: string; password?: string }
  const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : ''
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (!normalizedUsername || !/^[a-z0-9._-]{3,40}$/.test(normalizedUsername) || !normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || !password || password.length < 12) return reply.code(400).send({ error: 'Valid username, email, and password of at least 12 characters required' })
  if (await users.findOne({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }] })) return reply.code(409).send({ error: 'Staff account already exists' })
  const result = await users.insertOne({ username: normalizedUsername, email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), role: 'staff' as Role })
  return reply.code(201).send({ id: result.insertedId.toString(), username: normalizedUsername, email: normalizedEmail, role: 'staff' })
})
app.post('/api/admin/service-admins', { preHandler: editor }, async (request: any, reply) => {
  if (request.user.role !== 'admin') return reply.code(403).send({ error: 'Admin only' })
  const { email, password } = request.body as { email?: string; password?: string }
  if (!email?.includes('@') || !password || password.length < 12) return reply.code(400).send({ error: 'Valid email and password of at least 12 characters required' })
  const normalized = email.trim().toLowerCase()
  if (await users.findOne({ email: normalized })) return reply.code(409).send({ error: 'User already exists' })
  const result = await users.insertOne({ email: normalized, passwordHash: await bcrypt.hash(password, 12), role: 'service_admin' as Role })
  return reply.code(201).send({ id: result.insertedId.toString(), email: normalized, role: 'service_admin' })
})
registerRoster(app, db, editor)
await registerMainpageMedia(app, db, editor)
app.addHook('onClose', async () => { await client.close() })
await app.listen({ port, host: '0.0.0.0' })
