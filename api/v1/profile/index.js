const { db, setCors } = require('../../../lib/turso')
const { verifyToken } = require('../../../lib/verifyToken')

function toProfile(row) {
  if (!row) return null
  return {
    nameZh:    row.name_zh,
    nameEn:    row.name_en,
    nickname:  row.nickname,
    birthDate: row.birth_date,
    phone:     row.phone,
    email:     row.email,
    bio:       row.bio,
    photoUrl:  row.photo_url,
    education: (() => { try { return JSON.parse(row.education || '[]') } catch { return [] } })(),
    skills:    (() => { try { return JSON.parse(row.skills   || '[]') } catch { return [] } })(),
    licenses:  (() => { try { return JSON.parse(row.licenses || '[]') } catch { return [] } })(),
    links:     (() => { try { return JSON.parse(row.links    || '[]') } catch { return [] } })(),
    updatedAt: row.updated_at,
  }
}

async function ensureProfileTable() {
  await db().execute(`CREATE TABLE IF NOT EXISTS nico_profile (
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
}

module.exports = async (req, res) => {
  setCors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  try {
    await ensureProfileTable()
  } catch {}

  // ── GET（公開）──
  if (req.method === 'GET') {
    try {
      const result = await db().execute("SELECT * FROM nico_profile WHERE id='main'")
      return res.status(200).json({ success: true, data: toProfile(result.rows[0]) })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
    }
  }

  // ── PUT（需驗證）──
  if (req.method === 'PUT') {
    if (!verifyToken(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' })
    }
    try {
      const { nameZh, nameEn, nickname, birthDate, phone, email, bio, photoUrl, education, skills, licenses, links } = req.body
      const now = Math.floor(Date.now() / 1000)

      await db().execute({
        sql: `INSERT INTO nico_profile (id, name_zh, name_en, nickname, birth_date, phone, email, bio, photo_url, education, skills, licenses, links, updated_at)
              VALUES ('main',?,?,?,?,?,?,?,?,?,?,?,?,?)
              ON CONFLICT(id) DO UPDATE SET
                name_zh=excluded.name_zh, name_en=excluded.name_en, nickname=excluded.nickname,
                birth_date=excluded.birth_date, phone=excluded.phone, email=excluded.email,
                bio=excluded.bio, photo_url=excluded.photo_url,
                education=excluded.education, skills=excluded.skills,
                licenses=excluded.licenses, links=excluded.links,
                updated_at=excluded.updated_at`,
        args: [
          nameZh || '林姿余', nameEn || 'Lin Tzu Yu', nickname || 'Nico',
          birthDate || null, phone || null, email || null, bio || null, photoUrl || null,
          JSON.stringify(education || []),
          JSON.stringify(skills   || []),
          JSON.stringify(licenses || []),
          JSON.stringify(links    || []),
          now,
        ],
      })

      const result = await db().execute("SELECT * FROM nico_profile WHERE id='main'")
      return res.status(200).json({ success: true, data: toProfile(result.rows[0]), message: '個人資料已更新' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}
