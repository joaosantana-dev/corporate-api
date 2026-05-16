const router  = require('express').Router()
const queries = require('../queries/teams.queries')
const { authenticate, authorize } = require('../../../middleware/auth')
const { httpError } = require('../../../middleware/errorHandler')

router.use(authenticate, authorize('admin', 'tecnico'))

// GET /api/helpdesk/teams
router.get('/', async (req, res, next) => {
  try {
    const technicians = await queries.listTechnicians()

    const withSpecialties = await Promise.all(
      technicians.map(async (tech) => ({
        ...tech,
        specialties: await queries.getTechSpecialties(tech.id),
      }))
    )

    res.json(withSpecialties)
  } catch (err) { next(err) }
})

// GET /api/helpdesk/teams/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [technicians, specialties] = await Promise.all([
      queries.listTechnicians(),
      queries.getTechSpecialties(req.params.id),
    ])
    const tech = technicians.find(t => t.id === +req.params.id)
    if (!tech) throw httpError(404, 'Técnico não encontrado')
    res.json({ ...tech, specialties })
  } catch (err) { next(err) }
})

// PUT /api/helpdesk/teams/:id/specialties (admin only)
router.put('/:id/specialties', authorize('admin'), async (req, res, next) => {
  try {
    const { category_ids } = req.body
    if (!Array.isArray(category_ids)) throw httpError(400, 'category_ids deve ser um array')
    const specialties = await queries.setSpecialties(req.params.id, category_ids)
    res.json(specialties)
  } catch (err) { next(err) }
})

module.exports = router
