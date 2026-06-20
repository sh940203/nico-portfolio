const { createClient } = require('@libsql/client')

let _client = null
let _initPromise = null

function getClient() {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return _client
}

async function ensureSchema(c) {
  await c.batch([
    `CREATE TABLE IF NOT EXISTS nico_works (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('painting','packaging')),
      series TEXT,
      year INTEGER NOT NULL,
      medium TEXT,
      description TEXT,
      cover_image_url TEXT NOT NULL,
      cover_image_public_id TEXT NOT NULL,
      cover_image_width INTEGER,
      cover_image_height INTEGER,
      detail_images TEXT NOT NULL DEFAULT '[]',
      display_order INTEGER NOT NULL DEFAULT 0,
      is_visible INTEGER NOT NULL DEFAULT 1,
      is_featured INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )`,
    `CREATE TABLE IF NOT EXISTS nico_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      sender_ip TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )`,
    `CREATE TABLE IF NOT EXISTS nico_admins (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '管理員',
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )`,
  ], 'write')

  // 遷移：補上 series / level 欄位（若不存在）
  const cols = await c.execute("PRAGMA table_info(nico_works)")
  if (!cols.rows.some(r => r.name === 'series')) {
    await c.execute("ALTER TABLE nico_works ADD COLUMN series TEXT")
  }
  if (!cols.rows.some(r => r.name === 'level')) {
    await c.execute("ALTER TABLE nico_works ADD COLUMN level TEXT")
  }

  // nico_profile：單列個人資訊（upsert by id='main'）
  await c.execute(`CREATE TABLE IF NOT EXISTS nico_profile (
    id TEXT PRIMARY KEY DEFAULT 'main',
    name_zh TEXT NOT NULL DEFAULT '林姿余',
    name_en TEXT NOT NULL DEFAULT 'Lin Tzu Yu',
    nickname TEXT NOT NULL DEFAULT 'Nico',
    birth_date TEXT,
    phone TEXT,
    email TEXT,
    bio TEXT,
    photo_url TEXT,
    education TEXT NOT NULL DEFAULT '[]',
    skills TEXT NOT NULL DEFAULT '[]',
    licenses TEXT NOT NULL DEFAULT '[]',
    links TEXT NOT NULL DEFAULT '[]',
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  )`)

  // 插入預設資料（若尚無記錄）
  const prof = await c.execute("SELECT id FROM nico_profile WHERE id='main'")
  if (!prof.rows[0]) {
    await c.execute({
      sql: `INSERT INTO nico_profile (id, name_zh, name_en, nickname, birth_date, phone, email, bio, education, skills, licenses, links)
            VALUES ('main','林姿余','Lin Tzu Yu','Nico','2004-07-25','0905-616-725','noco20040725@gmail.com',
            '嶺東科技大學時尚經營系應屆畢業生，專注於數位插畫、IP 角色設計與包裝視覺。',
            '[{"school":"龍津國中","dept":"美術班","year":""},{"school":"明道中學","dept":"美工科","year":""},{"school":"嶺東科技大學","dept":"時尚經營系","year":"2026"}]',
            '["Adobe Photoshop","Adobe Illustrator","Adobe InDesign","Procreate","CapCut"]',
            '[]',
            '[]')`,
      args: [],
    })
  }
}

async function connectDB() {
  const c = getClient()
  if (!_initPromise) {
    _initPromise = ensureSchema(c).catch(err => {
      _initPromise = null
      throw err
    })
  }
  await _initPromise
  console.log('Turso DB ready')
  return c
}

function db() {
  return getClient()
}

module.exports = { connectDB, db }
