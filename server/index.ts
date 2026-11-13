import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import bcrypt from 'bcryptjs'
import { MongoClient } from 'mongodb'

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
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const adminPassword = process.env.ADMIN_PASSWORD
if (adminEmail && adminPassword && !(await users.findOne({ email: adminEmail }))) {
  await users.insertOne({ email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 12), role: 'admin' })
  app.log.info('Initial admin account created')
}
await app.register(cors, { origin: process.env.WEB_ORIGIN || 'http://localhost:5173' })
await app.register(jwt, { secret: jwtSecret })

type Role = 'admin' | 'service_admin'
type Team = { praise: string[]; ushers: string[]; leaders: string[]; multimedia: string[] }
const emptyTeam: Team = { praise: [], ushers: [], leaders: [], multimedia: [] }
function isSunday(date: string) { const d = new Date(`${date}T00:00:00Z`); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date && d.getUTCDay() === 0 }
function cleanNames(value: unknown): string[] | null { return Array.isArray(value) && value.length <= 30 && value.every(x => typeof x === 'string' && x.length <= 80) ? value.map(x => x.trim()).filter(Boolean) : null }
async function editor(request: any, reply: any) { try { await request.jwtVerify(); if (!['admin', 'service_admin'].includes(request.user.role)) throw Error('Forbidden') } catch { return reply.code(401).send({ error: 'Unauthorized' }) } }
function serialize(doc: any) { return { id: doc._id.toString(), date: doc.date, theme: doc.theme || '', scripture: doc.scripture || '', notes: doc.notes || '', teams: { ...emptyTeam, ...doc.teams } } }

app.get('/api/health', async () => ({ ok: true }))
app.get('/api/services', async (request) => { const { from, limit } = request.query as { from?: string; limit?: string }; const docs = await services.find(from ? { date: { $gte: from } } : {}).sort({ date: 1 }).limit(Math.min(Math.max(Number(limit) || 12, 1), 52)).toArray(); return docs.map(serialize) })
app.get('/api/services/:date', async (request, reply) => { const { date } = request.params as { date: string }; if (!isSunday(date)) return reply.code(400).send({ error: 'Enter a Sunday date (YYYY-MM-DD)' }); const doc = await services.findOne({ date }); return doc ? serialize(doc) : { id: null, date, theme: '', scripture: '', notes: '', teams: emptyTeam } })
app.post('/api/auth/login', async (request, reply) => { const { email, password } = request.body as { email?: string; password?: string }; if (!email || !password) return reply.code(400).send({ error: 'Email and password required' }); const user = await users.findOne({ email: email.trim().toLowerCase() }); if (!user || !(await bcrypt.compare(password, String(user.passwordHash)))) return reply.code(401).send({ error: 'Invalid credentials' }); return { token: app.jwt.sign({ sub: user._id.toString(), role: user.role }, { expiresIn: '8h' }), role: user.role } })
app.get('/api/auth/me', { preHandler: editor }, async (request: any) => ({ role: request.user.role }))
app.put('/api/services/:date', { preHandler: editor }, async (request, reply) => {
  const { date } = request.params as { date: string }
  if (!isSunday(date)) return reply.code(400).send({ error: 'Choose a Sunday date' })
  const body = request.body as { theme?: unknown; scripture?: unknown; notes?: unknown; teams?: Record<string, unknown> }
  const teams = body?.teams
  if (!teams || typeof body.theme !== 'string' || body.theme.length > 120 || typeof body.scripture !== 'string' || body.scripture.length > 120 || typeof body.notes !== 'string' || body.notes.length > 1000) return reply.code(400).send({ error: 'Invalid service details' })
  const praise = cleanNames(teams.praise), ushers = cleanNames(teams.ushers), leaders = cleanNames(teams.leaders), multimedia = cleanNames(teams.multimedia)
  if (!praise || !ushers || !leaders || !multimedia) return reply.code(400).send({ error: 'Invalid team assignments' })
  await services.updateOne({ date }, { $set: { date, theme: body.theme.trim(), scripture: body.scripture.trim(), notes: body.notes.trim(), teams: { praise, ushers, leaders, multimedia }, updatedAt: new Date() } }, { upsert: true })
  return serialize(await services.findOne({ date }))
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
app.addHook('onClose', async () => { await client.close() })
await app.listen({ port, host: '0.0.0.0' })

