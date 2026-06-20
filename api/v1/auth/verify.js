const jwt = require('jsonwebtoken')
const { setCors } = require('../../../lib/turso')

module.exports = async (req, res) => {
  setCors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized', code: 'NO_TOKEN' })
  }
  try {
    const SECRET = process.env.JWT_SECRET
    if (!SECRET) return res.status(500).json({ success: false, error: '伺服器設定錯誤', code: 'CONFIG_ERROR' })
    const admin = jwt.verify(auth.split(' ')[1], SECRET)
    res.status(200).json({ success: true, data: { admin } })
  } catch {
    res.status(401).json({ success: false, error: 'Unauthorized', code: 'INVALID_TOKEN' })
  }
}
