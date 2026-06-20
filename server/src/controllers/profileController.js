const { db } = require('../utils/db')

function toProfile(row) {
  if (!row) return null
  return {
    nameZh: row.name_zh,
    nameEn: row.name_en,
    nickname: row.nickname,
    birthDate: row.birth_date,
    phone: row.phone,
    email: row.email,
    bio: row.bio,
    photoUrl: row.photo_url,
    education: JSON.parse(row.education || '[]'),
    skills: JSON.parse(row.skills || '[]'),
    licenses: JSON.parse(row.licenses || '[]'),
    links: JSON.parse(row.links || '[]'),
    updatedAt: row.updated_at,
  }
}

exports.getProfile = async (req, res) => {
  try {
    const result = await db().execute("SELECT * FROM nico_profile WHERE id='main'")
    res.json({ success: true, data: toProfile(result.rows[0]) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤' })
  }
}

exports.updateProfile = async (req, res) => {
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
        JSON.stringify(skills || []),
        JSON.stringify(licenses || []),
        JSON.stringify(links || []),
        now,
      ],
    })

    const result = await db().execute("SELECT * FROM nico_profile WHERE id='main'")
    res.json({ success: true, data: toProfile(result.rows[0]), message: '個人資料已更新' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤' })
  }
}
