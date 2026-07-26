const { db, setCors } = require('../../../lib/turso')
const { verifyToken } = require('../../../lib/verifyToken')
const { ensureSeriesTable, toSeries } = require('../../../lib/seriesTable')

module.exports = async (req, res) => {
  setCors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (!verifyToken(req)) return res.status(401).json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' })
  try { await ensureSeriesTable(db()) } catch {}

  const { id } = req.query

  // ── PUT（更新）──
  if (req.method === 'PUT') {
    try {
      const { label, en, description, displayOrder, value } = req.body || {}
      const fields = []
      const args = []
      if (label !== undefined)       { fields.push('label = ?');         args.push(label) }
      if (en !== undefined)          { fields.push('en = ?');            args.push(en) }
      if (description !== undefined) { fields.push('description = ?');   args.push(description) }
      if (displayOrder !== undefined){ fields.push('display_order = ?'); args.push(displayOrder) }
      if (value !== undefined)       { fields.push('value = ?');         args.push(value) }
      if (fields.length === 0) return res.status(400).json({ success: false, error: '無更新欄位', code: 'NO_FIELDS' })
      args.push(id)

      const upd = await db().execute({ sql: `UPDATE nico_series SET ${fields.join(', ')} WHERE id = ?`, args })
      if (upd.rowsAffected === 0) return res.status(404).json({ success: false, error: '分類不存在', code: 'NOT_FOUND' })
      const result = await db().execute({ sql: 'SELECT * FROM nico_series WHERE id = ?', args: [id] })
      return res.status(200).json({ success: true, data: toSeries(result.rows[0]), message: '分類已更新' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
    }
  }

  // ── DELETE ──
  if (req.method === 'DELETE') {
    try {
      const result = await db().execute({ sql: 'SELECT value FROM nico_series WHERE id = ?', args: [id] })
      if (!result.rows[0]) return res.status(404).json({ success: false, error: '分類不存在', code: 'NOT_FOUND' })
      // 檢查是否仍有作品使用此分類
      const used = await db().execute({ sql: 'SELECT COUNT(*) AS n FROM nico_works WHERE series = ?', args: [result.rows[0].value] })
      if (Number(used.rows[0].n) > 0) {
        return res.status(409).json({ success: false, error: `仍有 ${used.rows[0].n} 件作品使用此分類，請先改分類或刪除作品`, code: 'IN_USE' })
      }
      await db().execute({ sql: 'DELETE FROM nico_series WHERE id = ?', args: [id] })
      return res.status(200).json({ success: true, message: '分類已刪除' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}
