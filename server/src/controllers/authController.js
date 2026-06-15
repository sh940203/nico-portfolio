const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { db } = require('../utils/db')

exports.login = async (req, res) => {
  try {
    const { password } = req.body
    if (!password) {
      return res.status(400).json({ success: false, error: '請輸入密碼', code: 'MISSING_FIELDS' })
    }

    // 單一管理員：只需密碼（取第一筆 admin）
    const result = await db().execute({
      sql: 'SELECT id, email, password, name FROM nico_admins ORDER BY created_at ASC LIMIT 1',
      args: [],
    })
    const admin = result.rows[0]
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ success: false, error: '密碼錯誤', code: 'INVALID_CREDENTIALS' })
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({ success: true, data: { token, name: admin.name } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
  }
}

exports.verify = (req, res) => {
  res.json({ success: true, data: { admin: req.admin } })
}
