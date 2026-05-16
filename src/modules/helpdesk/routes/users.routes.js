const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const queries = require('../queries/users.queries')
const { authenticate, authorize } = require('../../../middleware/auth')
const { httpError } = require('../../../middleware/errorHandler')

router.use(authenticate)

// GET /api/helpdesk/users
router.get('/', authorize('admin', 'tecnico'), async (req, res, next) => {
  try {
    const { status, role, page = 1, limit = 20 } = req.query
    const users = await queries.list({ status, role, page: +page, limit: +limit })
    res.json(users)
  } catch (err) { next(err) }
})

// POST /api/helpdesk/users (admin only)
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body
    if (!name || !email || !password) throw httpError(400, 'name, email e password são obrigatórios')

    const exists = await queries.findByEmail(email)
    if (exists) throw httpError(409, 'E-mail já cadastrado')

    const password_hash = await bcrypt.hash(password, 10)
    const user = await queries.create({ name, email, password_hash, role: role || 'usuario', department })
    res.status(201).json(user)
  } catch (err) { next(err) }
})

// GET /api/helpdesk/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    // Usuário comum só acessa próprio perfil
    if (req.user.role === 'usuario' && req.user.id !== +req.params.id) {
      throw httpError(403, 'Acesso negado')
    }
    const user = await queries.findById(req.params.id)
    if (!user) throw httpError(404, 'Usuário não encontrado')
    res.json(user)
  } catch (err) { next(err) }
})

// PUT /api/helpdesk/users/:id
router.put('/:id', async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin'
    const isSelf  = req.user.id === +req.params.id

    if (!isAdmin && !isSelf) throw httpError(403, 'Acesso negado')

    const user = await queries.findById(req.params.id)
    if (!user) throw httpError(404, 'Usuário não encontrado')

    const updateData = {}

    if (isAdmin) {
      const { name, email, role, department, status } = req.body
      Object.assign(updateData, { name, email, role, department, status })
    } else {
      // Usuário comum pode editar só nome e departamento
      const { name, department } = req.body
      Object.assign(updateData, { name, department })
    }

    if (req.body.password) {
      updateData.password_hash = await bcrypt.hash(req.body.password, 10)
    }

    // Remove campos undefined
    Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k])

    const updated = await queries.update(req.params.id, updateData)
    res.json(updated)
  } catch (err) { next(err) }
})

// DELETE /api/helpdesk/users/:id (admin only)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    if (req.user.id === +req.params.id) throw httpError(400, 'Não é possível remover a própria conta')
    const deleted = await queries.remove(req.params.id)
    if (!deleted) throw httpError(404, 'Usuário não encontrado')
    res.status(204).end()
  } catch (err) { next(err) }
})

module.exports = router
