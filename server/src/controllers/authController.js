const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { db } = require('../utils/db')

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, error: '請填寫帳號與密碼', code: 'MISSING_FIELDS' })
    }

    const result = await db().execute({
      sql: 'SELECT id, email, password, name FROM nico_admins WHERE email = ?',
      args: [email.toLowerCase()],
    })
    const admin = result.rows[0]
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ success: false, error: '帳號或密碼錯誤', code: 'INVALID_CREDENTIALS' })
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
