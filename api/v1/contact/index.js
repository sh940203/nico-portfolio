const { randomUUID } = require('crypto')
const { db, setCors } = require('../../../lib/turso')

module.exports = async (req, res) => {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  try {
    const { name, email, message } = req.body || {}
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: '請填寫所有欄位', code: 'MISSING_FIELDS' })
    }
    if (message.length < 10) {
      return res.status(400).json({ success: false, error: '訊息至少 10 個字', code: 'VALIDATION_ERROR' })
    }

    const now = Math.floor(Date.now() / 1000)
    await db().execute({
      sql: 'INSERT INTO nico_messages (id, name, email, message, sender_ip, created_at) VALUES (?,?,?,?,?,?)',
      args: [randomUUID(), name, email.toLowerCase(), message, req.headers['x-forwarded-for'] || '', now],
    })

    res.status(201).json({ success: true, message: '訊息已送出' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
  }
}
