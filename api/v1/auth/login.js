const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { db, setCors } = require('../../../lib/turso')

// 只需密碼的登入（單一管理員）
module.exports = async (req, res) => {
  setCors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  try {
    const SECRET = process.env.JWT_SECRET
    if (!SECRET) return res.status(500).json({ success: false, error: '伺服器設定錯誤', code: 'CONFIG_ERROR' })

    const { password } = req.body || {}
    if (!password) return res.status(400).json({ success: false, error: '請輸入密碼', code: 'MISSING_FIELDS' })

    const result = await db().execute('SELECT id, email, password, name FROM nico_admins ORDER BY created_at ASC LIMIT 1')
    const admin = result.rows[0]
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      await new Promise(r => setTimeout(r, 800))
      return res.status(401).json({ success: false, error: '密碼錯誤', code: 'INVALID_CREDENTIALS' })
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      SECRET,
      { expiresIn: '7d' }
    )
    res.status(200).json({ success: true, data: { token, name: admin.name } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
  }
}
