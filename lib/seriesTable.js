// 共用：nico_series 分類系列資料表（serverless 與本地 Express 皆用）
const { randomUUID } = require('crypto')

// 預設分類（對應目前資料庫中作品實際使用的 series 值）
const DEFAULT_SERIES = [
  { category: 'painting', value: 'ryu',        label: '精選 · 電繪插畫', en: 'RYU · Digital Art',      description: '入禾 RYU 個人品牌數位插畫創作', display_order: 1 },
  { category: 'painting', value: 'oil',        label: '油畫',           en: 'Oil Painting',          description: '油畫、畫布',                 display_order: 2 },
  { category: 'painting', value: 'pastel',     label: '粉彩',           en: 'Pastel',                description: '粉彩手繪',                   display_order: 3 },
  { category: 'painting', value: 'pen',        label: '原子筆',         en: 'Ballpoint Pen',         description: '原子筆細密畫',               display_order: 4 },
  { category: 'painting', value: 'ip',         label: 'IP 角色設計',    en: 'IP Character Design',   description: '原創吉祥物角色設計',         display_order: 5 },
  { category: 'painting', value: 'poster',     label: '海報設計',       en: 'Poster Design',         description: '平面視覺設計',               display_order: 6 },
  { category: 'painting', value: 'exhibition', label: '畢業展覽',       en: 'Exhibition',            description: '青蘋果作品展',               display_order: 7 },
  { category: 'packaging', value: 'bento',     label: '沙卡里巴 便當盒', en: 'Bento Box',            description: '便當盒包裝設計',             display_order: 1 },
  { category: 'packaging', value: 'egg',       label: '神福 雞蛋盒',    en: 'Egg Carton',            description: '雞蛋盒包裝設計',             display_order: 2 },
]

function toSeries(row) {
  return {
    id: row.id,
    category: row.category,
    value: row.value,
    label: row.label,
    en: row.en,
    description: row.description,
    displayOrder: row.display_order,
  }
}

// 建立資料表；若為空則填入預設分類
async function ensureSeriesTable(db) {
  await db.execute(`CREATE TABLE IF NOT EXISTS nico_series (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    en TEXT,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  )`)

  const count = await db.execute('SELECT COUNT(*) AS n FROM nico_series')
  if (Number(count.rows[0].n) === 0) {
    for (const s of DEFAULT_SERIES) {
      await db.execute({
        sql: `INSERT INTO nico_series (id, category, value, label, en, description, display_order)
              VALUES (?,?,?,?,?,?,?)`,
        args: [randomUUID(), s.category, s.value, s.label, s.en, s.description, s.display_order],
      })
    }
  }
}

module.exports = { ensureSeriesTable, toSeries, DEFAULT_SERIES }
