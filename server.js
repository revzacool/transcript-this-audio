import 'dotenv/config'
import Fastify from 'fastify'
import OpenAI from 'openai'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const app = Fastify()

app.register(fastifyStatic, {
  root: path.join(process.cwd(), 'public')
})

app.register(fastifyMultipart)

app.post('/transcribe', async (request, reply) => {
  const data = await request.file()
  const allowedFormats = ['.mp3', '.flac']
  const fileExtension = path.extname(data.filename).toLowerCase()

  if (!allowedFormats.includes(fileExtension)) {
    return reply.code(400).send('Invalid file format. Only MP3 and FLAC are allowed.')
  }

  const uploadPath = path.join(process.cwd(), 'uploads', data.filename)
  await fs.promises.writeFile(uploadPath, await data.toBuffer())

  const audioStream = fs.createReadStream(uploadPath)

  const transcription = await openai.audio.transcriptions.create({
    file: audioStream,
    model: 'whisper-1',
    response_format: 'text'
  })

  await fs.promises.unlink(uploadPath)

  reply.send(transcription)
})

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
