require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { connectDB, db } = require('./db')

async function seedAdmin() {
  await connectDB()

  const existing = await db().execute({
    sql: 'SELECT id FROM nico_admins WHERE email = ?',
    args: ['admin@portfolio.com'],
  })
  if (existing.rows[0]) {
    console.log('管理員帳號已存在')
    process.exit(0)
  }

  const hash = await bcrypt.hash('ChangeMe123!', 12)
  await db().execute({
    sql: 'INSERT INTO nico_admins (id, email, password, name) VALUES (?,?,?,?)',
    args: [uuidv4(), 'admin@portfolio.com', hash, '後台管理員'],
  })

  console.log('✅ 管理員帳號建立成功')
  console.log('   Email: admin@portfolio.com')
  console.log('   請立即登入並修改密碼')
  process.exit(0)
}

seedAdmin().catch(console.error)
