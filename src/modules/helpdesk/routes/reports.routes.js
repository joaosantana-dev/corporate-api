const router  = require('express').Router()
const queries = require('../queries/reports.queries')
const { authenticate, authorize } = require('../../../middleware/auth')

router.use(authenticate, authorize('admin', 'tecnico'))

// GET /api/helpdesk/reports/summary
router.get('/summary', async (req, res, next) => {
  try {
    res.json(await queries.summary())
  } catch (err) { next(err) }
})

// GET /api/helpdesk/reports/by-category
router.get('/by-category', async (req, res, next) => {
  try {
    res.json(await queries.byCategory())
  } catch (err) { next(err) }
})

// GET /api/helpdesk/reports/by-priority
router.get('/by-priority', async (req, res, next) => {
  try {
    res.json(await queries.byPriority())
  } catch (err) { next(err) }
})

// GET /api/helpdesk/reports/by-technician
router.get('/by-technician', async (req, res, next) => {
  try {
    res.json(await queries.byTechnician())
  } catch (err) { next(err) }
})

module.exports = router
