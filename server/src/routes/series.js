const express = require('express')
const { getSeries, createSeries, updateSeries, deleteSeries } = require('../controllers/seriesController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.get('/', getSeries)
router.post('/', authMiddleware, createSeries)
router.put('/:id', authMiddleware, updateSeries)
router.delete('/:id', authMiddleware, deleteSeries)

module.exports = router
