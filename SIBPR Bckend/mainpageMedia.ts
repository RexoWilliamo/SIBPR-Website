import type { FastifyInstance } from 'fastify'
import { Db, GridFSBucket, ObjectId } from 'mongodb'

const slots = {
  'hero-video-1': 'video', 'hero-video-2': 'video', 'hero-video-3': 'video',
  'hero-poster-1': 'image', 'hero-poster-2': 'image', 'hero-poster-3': 'image',
  'about-photo': 'image', 'women-photo': 'image', 'men-photo': 'image', 'youth-photo': 'image',
  'hero-background': 'image', 'events-photo': 'image', 'schedule-photo': 'image', 'connect-photo': 'image',
  'site-logo': 'image',
  'about-video': 'video', 'events-video': 'video', 'schedule-video': 'video',
  'women-video': 'video', 'men-video': 'video', 'youth-video': 'video', 'connect-video': 'video',
} as const

type Slot = keyof typeof slots
type MediaDocument = { slot: Slot; fileId: ObjectId; contentType: string; updatedAt: Date }
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'])

function matchesContent(contentType: string, bytes: Buffer) {
  if (contentType === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (contentType === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  if (contentType === 'image/webp') return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
  if (contentType === 'video/mp4') return bytes.toString('ascii', 4, 8) === 'ftyp'
  if (contentType === 'video/webm') return bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))
  return false
}

export async function registerMainpageMedia(app: FastifyInstance, db: Db, editor: (request: any, reply: any) => Promise<unknown>) {
  const media = db.collection<MediaDocument>('mainpage_media')
  const bucket = new GridFSBucket(db, { bucketName: 'mainpage_uploads' })
  await media.createIndex({ slot: 1 }, { unique: true })
  app.addContentTypeParser(/^(image\/(jpeg|png|webp)|video\/(mp4|webm))$/, { parseAs: 'buffer', bodyLimit: 32 * 1024 * 1024 }, (_request, body, done) => done(null, body))

  app.get('/api/mainpage/media', async () => {
    const documents = await media.find({}).toArray()
    return Object.fromEntries(documents.map(item => [item.slot, `/api/mainpage/media/${item.slot}?v=${item.fileId.toString()}`]))
  })

  app.get<{ Params: { slot: string } }>('/api/mainpage/media/:slot', async (request, reply) => {
    if (!(request.params.slot in slots)) return reply.code(404).send({ error: 'Media slot not found' })
    const document = await media.findOne({ slot: request.params.slot as Slot })
    if (!document) return reply.code(404).send({ error: 'Media not found' })
    const file = await db.collection<{ _id: ObjectId; length: number }>('mainpage_uploads.files').findOne({ _id: document.fileId })
    if (!file) return reply.code(404).send({ error: 'Media file not found' })
    reply.header('Content-Type', document.contentType)
    reply.header('Cache-Control', 'public, max-age=3600')
    reply.header('Accept-Ranges', 'bytes')
    const range = request.headers.range
    if (range && document.contentType.startsWith('video/')) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range)
      if (!match) return reply.code(416).header('Content-Range', `bytes */${file.length}`).send()
      const start = Number(match[1])
      const end = match[2] ? Math.min(Number(match[2]), file.length - 1) : file.length - 1
      if (start >= file.length || end < start) return reply.code(416).header('Content-Range', `bytes */${file.length}`).send()
      reply.code(206).header('Content-Range', `bytes ${start}-${end}/${file.length}`).header('Content-Length', end - start + 1)
      return reply.send(bucket.openDownloadStream(document.fileId, { start, end: end + 1 }))
    }
    reply.header('Content-Length', file.length)
    return reply.send(bucket.openDownloadStream(document.fileId))
  })

  app.put<{ Params: { slot: string } }>('/api/management/mainpage/media/:slot', { preHandler: editor }, async (request: any, reply) => {
    const slot = request.params.slot as Slot
    if (!(slot in slots)) return reply.code(404).send({ error: 'Media slot not found' })
    if (!['admin', 'staff'].includes(request.user.role)) return reply.code(403).send({ error: 'Staff access required' })
    const contentType = String(request.headers['content-type'] || '').split(';')[0].toLowerCase()
    const bytes = request.body
    if (!allowedTypes.has(contentType) || !Buffer.isBuffer(bytes) || !matchesContent(contentType, bytes) || (slots[slot] === 'video') !== contentType.startsWith('video/')) return reply.code(400).send({ error: 'Choose a valid image or video for this section' })
    if (bytes.length === 0 || bytes.length > (slots[slot] === 'video' ? 30 : 8) * 1024 * 1024) return reply.code(413).send({ error: 'File exceeds the size limit' })
    const upload = bucket.openUploadStream(slot, { metadata: { contentType } })
    await new Promise<void>((resolve, reject) => { upload.once('finish', resolve); upload.once('error', reject); upload.end(bytes) })
    const previous = await media.findOneAndUpdate({ slot }, { $set: { slot, fileId: upload.id, contentType, updatedAt: new Date() } }, { upsert: true, returnDocument: 'before' })
    if (previous?.fileId) await bucket.delete(previous.fileId).catch(() => {})
    return { url: `/api/mainpage/media/${slot}?v=${upload.id.toString()}` }
  })

  app.delete<{ Params: { slot: string } }>('/api/management/mainpage/media/:slot', { preHandler: editor }, async (request: any, reply) => {
    const slot = request.params.slot as Slot
    if (!(slot in slots)) return reply.code(404).send({ error: 'Media slot not found' })
    if (!['admin', 'staff'].includes(request.user.role)) return reply.code(403).send({ error: 'Staff access required' })
    const previous = await media.findOneAndDelete({ slot })
    if (previous?.fileId) await bucket.delete(previous.fileId).catch(() => {})
    return { restored: true }
  })
}
