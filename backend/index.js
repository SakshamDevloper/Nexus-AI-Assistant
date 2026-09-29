import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import admin from 'firebase-admin'

import { connectMongo, closeMongo } from './src/services/memory/mongo.js'
import { connectRedis, closeRedis } from './src/services/memory/redis.js'
import { streamResponse, initModels } from './src/services/llm/router.js'
import { toolDefinitions, executeTool } from './src/services/tools/index.js'
import authRoutes from './src/routes/auth.js'
import memoryRoutes from './src/routes/memory.js'
import fileRoutes from './src/routes/files.js'
import suggestionsRoutes from './src/routes/suggestions.js'
import compareRoutes from './src/routes/compare.js'
import branchesRoutes from './src/routes/branches.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/memory', memoryRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/suggestions', suggestionsRoutes)
app.use('/api/compare', compareRoutes)
app.use('/api/branches', branchesRoutes)

function parsePrivateKey(raw) {
  if (!raw) return raw
  let key = raw.trim()
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1)
  }
  if (key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n')
  }
  return key
}

try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      }),
    })
    console.log('Firebase Admin initialized')
  } else {
    console.warn('Firebase credentials not set — auth endpoints will return 503')
  }
} catch (err) {
  console.error('Firebase init error:', err.message)
}

app.get('/', (req, res) => {
  res.json({ name: 'NexusAI Backend', version: '1.0.0', status: 'running' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.get('/api/tools', (req, res) => {
  res.json(toolDefinitions)
})

app.post('/api/chat', async (req, res) => {
  const { content, model, history } = req.body

  if (!content) {
    return res.status(400).json({ error: 'Message content is required' })
  }

  try {
    const messages = [
      {
        role: 'system',
        content: `You are NexusAI, a helpful AI assistant with access to tools.
Current date: ${new Date().toISOString().split('T')[0]}.
Use tools when you need real-time information, weather, or factual lookups.
Be concise but thorough. Format code blocks with language tags.`,
      },
      ...(history || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content },
    ]

    let currentMessages = [...messages]
    let maxIterations = 3
    let iteration = 0
    let fullContent = ''
    let allToolCalls = []

    while (iteration < maxIterations) {
      let toolCallsMade = false
      let iterationContent = ''

      await streamResponse(
        model,
        currentMessages,
        toolDefinitions,
        (token) => { iterationContent += token; fullContent += token },
        async (callId, name, args) => {
          toolCallsMade = true
          const result = await executeTool(name, args)
          allToolCalls.push({ id: callId, name, arguments: JSON.stringify(args), result: JSON.stringify(result) })
          currentMessages.push({
            role: 'assistant',
            content: iterationContent || null,
            tool_calls: [{ id: callId, type: 'function', function: { name, arguments: JSON.stringify(args) } }],
          })
          currentMessages.push({ role: 'tool', tool_call_id: callId, content: JSON.stringify(result) })
        }
      )

      if (iterationContent && !toolCallsMade) {
        currentMessages.push({ role: 'assistant', content: iterationContent })
      }

      if (!toolCallsMade) break
      iteration++
    }

    res.json({ content: fullContent, toolCalls: allToolCalls })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: error.message })
  }
})

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  socket.on('chat', async (data) => {
    const { messageId, content, model, history } = data

    try {
      const messages = [
        {
          role: 'system',
          content: `You are NexusAI, a helpful AI assistant with access to tools. 
Current date: ${new Date().toISOString().split('T')[0]}.
Use tools when you need real-time information, weather, or factual lookups.
Be concise but thorough. Format code blocks with language tags.`,
        },
        ...(history || []).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content },
      ]

      let currentMessages = [...messages]
      let maxIterations = 3
      let iteration = 0

      let fullContent = ''

      while (iteration < maxIterations) {
        let toolCallsMade = false
        let iterationContent = ''

        await streamResponse(
          model,
          currentMessages,
          toolDefinitions,
          (token) => {
            iterationContent += token
            fullContent += token
            socket.emit('token', { messageId, content: token })
          },
          async (callId, name, args) => {
            toolCallsMade = true
            socket.emit('tool_call', { callId, name, arguments: JSON.stringify(args) })

            const result = await executeTool(name, args)

            socket.emit('tool_result', { callId, result: JSON.stringify(result) })

            currentMessages.push({
              role: 'assistant',
              content: iterationContent || null,
              tool_calls: [{ id: callId, type: 'function', function: { name, arguments: JSON.stringify(args) } }],
            })

            currentMessages.push({
              role: 'tool',
              tool_call_id: callId,
              content: JSON.stringify(result),
            })
          }
        )

        if (iterationContent && !toolCallsMade) {
          currentMessages.push({ role: 'assistant', content: iterationContent })
        }

        if (!toolCallsMade) break
        iteration++
      }

      socket.emit('message_complete', { messageId, content: fullContent })
    } catch (error) {
      console.error('Chat error:', error)
      socket.emit('error', { message: error.message })
    }
  })

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

async function start() {
  await connectMongo()
  await connectRedis()
  await initModels()
  const PORT = process.env.PORT || 3001
  httpServer.listen(PORT, () => {
    console.log(`NexusAI Backend running on http://localhost:${PORT}`)
  })
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...')
  await closeMongo()
  await closeRedis()
  httpServer.close(() => process.exit(0))
})

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

start().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
