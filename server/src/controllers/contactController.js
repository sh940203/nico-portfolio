const { v4: uuidv4 } = require('uuid')
const { db } = require('../utils/db')
const { sendContactEmail } = require('../utils/mailer')

exports.sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: '請填寫所有欄位', code: 'MISSING_FIELDS' })
    }
    if (message.length < 10) {
      return res.status(400).json({ success: false, error: '訊息至少 10 個字', code: 'VALIDATION_ERROR' })
    }

    const id = uuidv4()
    const senderIp = req.ip
    const now = Math.floor(Date.now() / 1000)

    await db().execute({
      sql: 'INSERT INTO nico_messages (id, name, email, message, sender_ip, created_at) VALUES (?,?,?,?,?,?)',
      args: [id, name, email.toLowerCase(), message, senderIp, now],
    })

    try {
      await sendContactEmail({ name, email, message })
    } catch (mailErr) {
      console.error('Email 發送失敗:', mailErr.message)
    }

    res.status(201).json({ success: true, message: '訊息已送出', data: { id } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
  }
}

exports.getMessages = async (req, res) => {
  try {
    const { isRead } = req.query
    let sql = 'SELECT id, name, email, message, is_read, created_at FROM nico_messages'
    const args = []
    if (isRead !== undefined) {
      sql += ' WHERE is_read = ?'
      args.push(isRead === 'true' ? 1 : 0)
    }
    sql += ' ORDER BY created_at DESC'

    const result = await db().execute({ sql, args })
    const data = result.rows.map(r => ({ ...r, isRead: r.is_read === 1 }))
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
  }
}

exports.markAsRead = async (req, res) => {
  try {
    const result = await db().execute({
      sql: 'UPDATE nico_messages SET is_read = 1 WHERE id = ?',
      args: [req.params.id],
    })
    if (result.rowsAffected === 0) return res.status(404).json({ success: false, error: '訊息不存在', code: 'NOT_FOUND' })
    res.json({ success: true, message: '已標記為已讀' })
  } catch (err) {
    res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
  }
}

exports.deleteMessage = async (req, res) => {
  try {
    const result = await db().execute({
      sql: 'DELETE FROM nico_messages WHERE id = ?',
      args: [req.params.id],
    })
    if (result.rowsAffected === 0) return res.status(404).json({ success: false, error: '訊息不存在', code: 'NOT_FOUND' })
    res.json({ success: true, message: '訊息已刪除' })
  } catch (err) {
    res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
  }
}
