const { randomUUID } = require('crypto')
const { db, setCors } = require('../../../lib/turso')
const { verifyToken } = require('../../../lib/verifyToken')
const { ensureSeriesTable, toSeries } = require('../../../lib/seriesTable')

module.exports = async (req, res) => {
  setCors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  try { await ensureSeriesTable(db()) } catch {}

  // ── GET（公開）──
  if (req.method === 'GET') {
    try {
      const { category } = req.query
      const args = []
      let sql = 'SELECT * FROM nico_series'
      if (category) { sql += ' WHERE category = ?'; args.push(category) }
      sql += ' ORDER BY display_order ASC, created_at ASC'
      const result = await db().execute({ sql, args })
      return res.status(200).json({ success: true, data: result.rows.map(toSeries) })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
    }
  }

  // ── POST（新增，需驗證）──
  if (req.method === 'POST') {
    if (!verifyToken(req)) return res.status(401).json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' })
    try {
      const { category, label, en, description, displayOrder = 0 } = req.body || {}
      if (!category || !label) return res.status(400).json({ success: false, error: '缺少分類或名稱', code: 'VALIDATION_ERROR' })
      const value = (req.body.value || 's_' + randomUUID().slice(0, 8)).trim()
      const id = randomUUID()
      await db().execute({
        sql: `INSERT INTO nico_series (id, category, value, label, en, description, display_order) VALUES (?,?,?,?,?,?,?)`,
        args: [id, category, value, label, en || null, description || null, displayOrder],
      })
      const result = await db().execute({ sql: 'SELECT * FROM nico_series WHERE id = ?', args: [id] })
      return res.status(201).json({ success: true, data: toSeries(result.rows[0]), message: '分類已新增' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}
