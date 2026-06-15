const express = require('express')
const rateLimit = require('express-rate-limit')
const { sendMessage, getMessages, markAsRead, deleteMessage } = require('../controllers/contactController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, error: '送出次數已達上限，請 1 小時後再試', code: 'RATE_LIMITED' },
})

router.post('/', contactLimiter, sendMessage)
router.get('/', authMiddleware, getMessages)
router.patch('/:id/read', authMiddleware, markAsRead)
router.delete('/:id', authMiddleware, deleteMessage)

module.exports = router
