import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'

import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  })
)

const port = process.env.PORT || 3000
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_health'

// Register models
import './models/User.js'
import './models/Resource.js'
import './models/ResourceAllocation.js'
import './models/Project.js'
import './models/Sprint.js'
import './models/SprintHealth.js'

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.get('/api/db/health', (req, res) => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }
  const state = mongoose.connection.readyState
  res.json({ ok: state === 1, state: states[state] || 'unknown' })
})

app.use('/api/auth', authRoutes)

async function start() {
  try {
    await mongoose.connect(mongoUri)
    console.log('MongoDB connected')
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`)
    })
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}

start()

function shutdown(signal) {
  return async () => {
    try {
      await mongoose.connection.close()
    } finally {
      process.exit(0)
    }
  }
}

process.on('SIGINT', shutdown('SIGINT'))
process.on('SIGTERM', shutdown('SIGTERM'))
