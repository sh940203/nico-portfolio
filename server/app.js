require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { connectDB } = require('./src/utils/db')

const app = express()

connectDB().catch(err => {
  console.error('Turso 連線失敗:', err.message)
  process.exit(1)
})

app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: '請求次數過多', code: 'RATE_LIMITED' },
})
app.use('/api', generalLimiter)

app.use('/api/v1/auth', require('./src/routes/auth'))
app.use('/api/v1/works', require('./src/routes/works'))
app.use('/api/v1/upload', require('./src/routes/upload'))
app.use('/api/v1/contact', require('./src/routes/contact'))

app.use((req, res) => {
  res.status(404).json({ success: false, error: '路由不存在', code: 'NOT_FOUND' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
})

module.exports = app
