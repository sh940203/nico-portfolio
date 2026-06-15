const express = require('express')
const rateLimit = require('express-rate-limit')
const { login, verify } = require('../controllers/authController')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: '登入嘗試次數過多，請 15 分鐘後再試', code: 'RATE_LIMITED' },
})

router.post('/login', loginLimiter, login)
router.get('/verify', authMiddleware, verify)

module.exports = router
