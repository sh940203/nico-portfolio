const express = require('express')
const { getWorks, getWork, createWork, updateWork, deleteWork, reorderWorks } = require('../controllers/worksController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.get('/', getWorks)
router.get('/:id', getWork)
router.post('/', authMiddleware, createWork)
router.put('/reorder', authMiddleware, reorderWorks)
router.put('/:id', authMiddleware, updateWork)
router.delete('/:id', authMiddleware, deleteWork)

module.exports = router
