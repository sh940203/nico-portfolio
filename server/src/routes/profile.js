const express = require('express')
const { getProfile, updateProfile } = require('../controllers/profileController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.get('/', getProfile)
router.put('/', authMiddleware, updateProfile)

module.exports = router
