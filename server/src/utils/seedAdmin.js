require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { connectDB, db } = require('./db')

// 單一管理員：只需密碼。預設密碼 0000（可用環境變數 ADMIN_PASSWORD 覆寫）
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '0000'

async function seedAdmin() {
  await connectDB()

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12)
  const existing = await db().execute('SELECT id FROM nico_admins ORDER BY created_at ASC LIMIT 1')

  if (existing.rows[0]) {
    await db().execute({
      sql: 'UPDATE nico_admins SET password = ? WHERE id = ?',
      args: [hash, existing.rows[0].id],
    })
    console.log(`✅ 管理員密碼已更新為：${ADMIN_PASSWORD}`)
  } else {
    await db().execute({
      sql: 'INSERT INTO nico_admins (id, email, password, name) VALUES (?,?,?,?)',
      args: [uuidv4(), 'admin@portfolio.com', hash, '後台管理員'],
    })
    console.log(`✅ 管理員建立成功，密碼：${ADMIN_PASSWORD}`)
  }
  process.exit(0)
}

seedAdmin().catch(console.error)
