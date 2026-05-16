const router  = require('express').Router()
const queries = require('../queries/tickets.queries')
const { authenticate, authorize } = require('../../../middleware/auth')
const { httpError } = require('../../../middleware/errorHandler')

// Todos os endpoints exigem autenticação
router.use(authenticate)

// GET /api/helpdesk/tickets
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, category_id, search, page = 1, limit = 10 } = req.query
    const { id: userId, role } = req.user

    const [data, total] = await Promise.all([
      queries.list({ userId, role, status, priority, categoryId: category_id, search, page: +page, limit: +limit }),
      queries.count({ userId, role, status, priority, categoryId: category_id, search }),
    ])

    res.json({
      data,
      meta: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) },
    })
  } catch (err) { next(err) }
})

// POST /api/helpdesk/tickets
router.post('/', async (req, res, next) => {
  try {
    const { title, description, category_id, priority, sla } = req.body
    if (!title || !category_id) throw httpError(400, 'title e category_id são obrigatórios')

    const ticket = await queries.create({
      title, description, category_id, priority: priority || 'media',
      sla, user_id: req.user.id,
    })
    res.status(201).json(ticket)
  } catch (err) { next(err) }
})

// GET /api/helpdesk/tickets/:id
router.get('/:id', async (req, res, next) => {
  try {
    const ticket = await queries.findById(req.params.id)
    if (!ticket) throw httpError(404, 'Chamado não encontrado')

    // Usuário comum só acessa próprio chamado
    if (req.user.role === 'usuario' && ticket.user_id !== req.user.id) {
      throw httpError(403, 'Acesso negado')
    }
    res.json(ticket)
  } catch (err) { next(err) }
})

// PUT /api/helpdesk/tickets/:id
router.put('/:id', async (req, res, next) => {
  try {
    const ticket = await queries.findById(req.params.id)
    if (!ticket) throw httpError(404, 'Chamado não encontrado')

    const { role, id: userId } = req.user
    const isOwner = ticket.user_id === userId

    // Usuário comum só pode editar título/descrição do próprio chamado
    if (role === 'usuario') {
      if (!isOwner) throw httpError(403, 'Acesso negado')
      const { title, description } = req.body
      const updated = await queries.update(req.params.id, { title, description })
      return res.json(updated)
    }

    // Admin e técnico podem alterar qualquer campo
    const { title, description, category_id, priority, status, tech_id, sla } = req.body
    const updated = await queries.update(req.params.id, {
      title, description, category_id, priority, status, tech_id, sla,
    })
    res.json(updated)
  } catch (err) { next(err) }
})

// DELETE /api/helpdesk/tickets/:id (admin only)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const deleted = await queries.remove(req.params.id)
    if (!deleted) throw httpError(404, 'Chamado não encontrado')
    res.status(204).end()
  } catch (err) { next(err) }
})

// GET /api/helpdesk/tickets/:id/comments
router.get('/:id/comments', async (req, res, next) => {
  try {
    const ticket = await queries.findById(req.params.id)
    if (!ticket) throw httpError(404, 'Chamado não encontrado')

    let comments = await queries.listComments(req.params.id)
    // Usuário comum não vê comentários internos
    if (req.user.role === 'usuario') {
      comments = comments.filter(c => !c.is_internal)
    }
    res.json(comments)
  } catch (err) { next(err) }
})

// POST /api/helpdesk/tickets/:id/comments
router.post('/:id/comments', async (req, res, next) => {
  try {
    const { content, is_internal } = req.body
    if (!content) throw httpError(400, 'content é obrigatório')

    const ticket = await queries.findById(req.params.id)
    if (!ticket) throw httpError(404, 'Chamado não encontrado')

    const comment = await queries.addComment({
      ticket_id:   req.params.id,
      user_id:     req.user.id,
      content,
      is_internal: req.user.role !== 'usuario' && !!is_internal,
    })
    res.status(201).json(comment)
  } catch (err) { next(err) }
})

module.exports = router
