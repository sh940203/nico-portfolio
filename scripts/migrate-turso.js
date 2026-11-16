#!/usr/bin/env node
/**
 * 搬移腳本：把 wan-ling-portfolio DB 的 nico_ 資料複製到新的 nico-portfolio DB
 *
 * 在本機執行前先設好環境變數（用 export，不要貼到聊天視窗）：
 *   SRC_TURSO_URL    wan-ling-portfolio 的 libsql:// URL
 *   SRC_TURSO_TOKEN  wan-ling-portfolio 的 auth token
 *   DST_TURSO_URL    新 nico-portfolio 的 libsql:// URL
 *   DST_TURSO_TOKEN  新 nico-portfolio 的 auth token
 *
 * 執行方式：
 *   node scripts/migrate-turso.js
 */

const { createClient } = require('@libsql/client')

const { SRC_TURSO_URL, SRC_TURSO_TOKEN, DST_TURSO_URL, DST_TURSO_TOKEN } = process.env

const missing = ['SRC_TURSO_URL', 'SRC_TURSO_TOKEN', 'DST_TURSO_URL', 'DST_TURSO_TOKEN']
  .filter(k => !process.env[k])
if (missing.length) {
  console.error('缺少環境變數：', missing.join(', '))
  process.exit(1)
}

const src = createClient({ url: SRC_TURSO_URL, authToken: SRC_TURSO_TOKEN })
const dst = createClient({ url: DST_TURSO_URL, authToken: DST_TURSO_TOKEN })

async function createSchema() {
  console.log('建立新 DB 的 schema...')
  await dst.batch([
    `CREATE TABLE IF NOT EXISTS nico_works (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      series TEXT,
      level TEXT,
      year INTEGER NOT NULL,
      medium TEXT,
      description TEXT,
      cover_image_url TEXT NOT NULL DEFAULT '',
      cover_image_public_id TEXT NOT NULL DEFAULT '',
      cover_image_width INTEGER,
      cover_image_height INTEGER,
      detail_images TEXT NOT NULL DEFAULT '[]',
      display_order INTEGER NOT NULL DEFAULT 0,
      is_visible INTEGER NOT NULL DEFAULT 1,
      is_featured INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )`,
    `CREATE TABLE IF NOT EXISTS nico_admins (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '管理員',
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
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
    `CREATE TABLE IF NOT EXISTS nico_profile (
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
    )`,
  ], 'write')
  console.log('Schema 建立完成')
}

async function migrateTable(table) {
  const result = await src.execute(`SELECT * FROM ${table}`)
  const rows = result.rows
  console.log(`${table}：${rows.length} 筆`)
  if (rows.length === 0) return

  const cols = result.columns
  const placeholders = cols.map(() => '?').join(', ')
  const sql = `INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`

  for (const row of rows) {
    const args = cols.map(c => {
      const v = row[c]
      return v === undefined ? null : v
    })
    await dst.execute({ sql, args })
  }
  console.log(`  ✅ ${rows.length} 筆已寫入`)
}

async function verify() {
  console.log('\n驗證：')
  for (const t of ['nico_works', 'nico_admins', 'nico_profile', 'nico_messages']) {
    const r = await dst.execute(`SELECT COUNT(*) as cnt FROM ${t}`)
    console.log(`  ${t}: ${r.rows[0].cnt} 筆`)
  }
}

async function main() {
  await createSchema()

  for (const table of ['nico_works', 'nico_admins', 'nico_profile', 'nico_messages']) {
    await migrateTable(table)
  }

  await verify()
  console.log('\n搬移完成！')
  console.log('\n接下來：')
  console.log('1. 在 Vercel 把 TURSO_URL 換成新 DB 的 URL')
  console.log('2. 把 TURSO_AUTH_TOKEN 換成新 DB 的 token')
  console.log('3. Redeploy')
}

main().catch(err => { console.error(err); process.exit(1) })
