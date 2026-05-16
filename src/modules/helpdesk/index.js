const router = require('express').Router()

router.use('/auth',       require('./routes/auth.routes'))
router.use('/tickets',    require('./routes/tickets.routes'))
router.use('/users',      require('./routes/users.routes'))
router.use('/categories', require('./routes/categories.routes'))
router.use('/teams',      require('./routes/teams.routes'))
router.use('/reports',    require('./routes/reports.routes'))

module.exports = router
