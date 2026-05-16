const router  = require('express').Router()
const queries = require('../queries/categories.queries')
const { authenticate, authorize } = require('../../../middleware/auth')
const { httpError } = require('../../../middleware/errorHandler')

router.use(authenticate)

// GET /api/helpdesk/categories
router.get('/', async (req, res, next) => {
  try {
    res.json(await queries.list())
  } catch (err) { next(err) }
})

// POST /api/helpdesk/categories (admin only)
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const { name, description, color } = req.body
    if (!name) throw httpError(400, 'name é obrigatório')

    const exists = await queries.findByName(name)
    if (exists) throw httpError(409, 'Categoria já existe')

    const category = await queries.create({ name, description, color: color || 'gray' })
    res.status(201).json(category)
  } catch (err) { next(err) }
})

// PUT /api/helpdesk/categories/:id (admin only)
router.put('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const cat = await queries.findById(req.params.id)
    if (!cat) throw httpError(404, 'Categoria não encontrada')

    const { name, description, color } = req.body
    const updated = await queries.update(req.params.id, { name, description, color })
    res.json(updated)
  } catch (err) { next(err) }
})

// DELETE /api/helpdesk/categories/:id (admin only)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const deleted = await queries.remove(req.params.id)
    if (!deleted) throw httpError(404, 'Categoria não encontrada')
    res.status(204).end()
  } catch (err) { next(err) }
})

module.exports = router
