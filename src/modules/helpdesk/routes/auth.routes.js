const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const crypto  = require('crypto')
const rateLimit = require('express-rate-limit')
const queries = require('../queries/auth.queries')
const { httpError } = require('../../../middleware/errorHandler')
const { authenticate } = require('../../../middleware/auth')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

function generateTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  })
  const refreshToken = crypto.randomBytes(40).toString('hex')
  return { accessToken, refreshToken }
}

function refreshExpiry() {
  const days = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '7', 10)
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

// POST /api/helpdesk/auth/login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) throw httpError(400, 'E-mail e senha são obrigatórios')

    const user = await queries.findByEmail(email)
    if (!user) throw httpError(401, 'Credenciais inválidas')
    if (user.status === 'inativo') throw httpError(403, 'Conta desativada')

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) throw httpError(401, 'Credenciais inválidas')

    const payload = { id: user.id, name: user.name, email: user.email, role: user.role }
    const { accessToken, refreshToken } = generateTokens(payload)

    await queries.saveRefreshToken(user.id, refreshToken, refreshExpiry())

    res.json({
      user: payload,
      access_token:  accessToken,
      refresh_token: refreshToken,
    })
  } catch (err) { next(err) }
})

// POST /api/helpdesk/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body
    if (!refresh_token) throw httpError(400, 'refresh_token é obrigatório')

    const record = await queries.findRefreshToken(refresh_token)
    if (!record) throw httpError(401, 'Refresh token inválido ou expirado')
    if (record.status === 'inativo') throw httpError(403, 'Conta desativada')

    const payload = { id: record.user_id, name: record.name, email: record.email, role: record.role }
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    })

    res.json({ access_token: accessToken })
  } catch (err) { next(err) }
})

// POST /api/helpdesk/auth/logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const { refresh_token } = req.body
    if (refresh_token) {
      await queries.deleteRefreshToken(refresh_token)
    } else {
      await queries.deleteAllUserTokens(req.user.id)
    }
    res.status(204).end()
  } catch (err) { next(err) }
})

// GET /api/helpdesk/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await queries.findByEmail(req.user.email)
    if (!user) throw httpError(404, 'Usuário não encontrado')
    const { password_hash, ...safe } = user
    res.json(safe)
  } catch (err) { next(err) }
})

module.exports = router
