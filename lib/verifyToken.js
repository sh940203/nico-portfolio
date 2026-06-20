const jwt = require('jsonwebtoken')

// 回傳 decoded payload，或 null（驗證失敗）
function verifyToken(req) {
  const SECRET = process.env.JWT_SECRET
  if (!SECRET) return null
  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Bearer ')) return null
  try {
    return jwt.verify(auth.split(' ')[1], SECRET)
  } catch {
    return null
  }
}

module.exports = { verifyToken }
