require('dotenv').config()

const express      = require('express')
const cors         = require('cors')
const helmet       = require('helmet')
const { errorHandler } = require('./middleware/errorHandler')

const helpdeskRoutes = require('./modules/helpdesk')
// futuramente: const system2Routes = require('./modules/system2')
// futuramente: const system3Routes = require('./modules/system3')

const app = express()

// ── Segurança e parsing ────────────────────────────────────────────────────
const isDev = (process.env.NODE_ENV || 'development') === 'development'

app.use(cors({
  origin: (origin, cb) => {
    // Em desenvolvimento: aceita qualquer localhost (qualquer porta) e requests sem origin (curl/Postman)
    if (isDev) {
      if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true)
    }
    // Em produção: só aceita a origin configurada
    const allowed = process.env.CORS_ORIGIN || 'http://localhost:5173'
    if (!origin || origin === allowed) return cb(null, true)
    cb(new Error(`CORS: origem não permitida → ${origin}`))
  },
  credentials: true,
}))
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(express.json())

// ── Healthcheck ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Módulos ────────────────────────────────────────────────────────────────
app.use('/api/helpdesk', helpdeskRoutes)
// app.use('/api/system2', system2Routes)
// app.use('/api/system3', system3Routes)

// ── Rota não encontrada ────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// ── Tratamento de erros (deve ser o último middleware) ─────────────────────
app.use(errorHandler)

module.exports = app
