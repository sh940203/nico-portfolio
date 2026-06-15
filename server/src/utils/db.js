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
