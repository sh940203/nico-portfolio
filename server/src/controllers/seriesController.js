const { randomUUID } = require('crypto')
const { db } = require('../utils/db')
const { ensureSeriesTable, toSeries } = require('../../../lib/seriesTable')

exports.getSeries = async (req, res) => {
  try {
    await ensureSeriesTable(db())
    const { category } = req.query
    const args = []
    let sql = 'SELECT * FROM nico_series'
    if (category) { sql += ' WHERE category = ?'; args.push(category) }
    sql += ' ORDER BY display_order ASC, created_at ASC'
    const result = await db().execute({ sql, args })
    res.json({ success: true, data: result.rows.map(toSeries) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤' })
  }
}

exports.createSeries = async (req, res) => {
  try {
    await ensureSeriesTable(db())
    const { category, label, en, description, displayOrder = 0 } = req.body || {}
    if (!category || !label) return res.status(400).json({ success: false, error: '缺少分類或名稱' })
    const value = (req.body.value || 's_' + randomUUID().slice(0, 8)).trim()
    const id = randomUUID()
    await db().execute({
      sql: `INSERT INTO nico_series (id, category, value, label, en, description, display_order) VALUES (?,?,?,?,?,?,?)`,
      args: [id, category, value, label, en || null, description || null, displayOrder],
    })
    const result = await db().execute({ sql: 'SELECT * FROM nico_series WHERE id = ?', args: [id] })
    res.status(201).json({ success: true, data: toSeries(result.rows[0]), message: '分類已新增' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤' })
  }
}

exports.updateSeries = async (req, res) => {
  try {
    const { label, en, description, displayOrder, value } = req.body || {}
    const fields = []
    const args = []
    if (label !== undefined)        { fields.push('label = ?');         args.push(label) }
    if (en !== undefined)           { fields.push('en = ?');            args.push(en) }
    if (description !== undefined)  { fields.push('description = ?');   args.push(description) }
    if (displayOrder !== undefined) { fields.push('display_order = ?'); args.push(displayOrder) }
    if (value !== undefined)        { fields.push('value = ?');         args.push(value) }
    if (fields.length === 0) return res.status(400).json({ success: false, error: '無更新欄位' })
    args.push(req.params.id)
    const upd = await db().execute({ sql: `UPDATE nico_series SET ${fields.join(', ')} WHERE id = ?`, args })
    if (upd.rowsAffected === 0) return res.status(404).json({ success: false, error: '分類不存在' })
    const result = await db().execute({ sql: 'SELECT * FROM nico_series WHERE id = ?', args: [req.params.id] })
    res.json({ success: true, data: toSeries(result.rows[0]), message: '分類已更新' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤' })
  }
}

exports.deleteSeries = async (req, res) => {
  try {
    const result = await db().execute({ sql: 'SELECT value FROM nico_series WHERE id = ?', args: [req.params.id] })
    if (!result.rows[0]) return res.status(404).json({ success: false, error: '分類不存在' })
    const used = await db().execute({ sql: 'SELECT COUNT(*) AS n FROM nico_works WHERE series = ?', args: [result.rows[0].value] })
    if (Number(used.rows[0].n) > 0) {
      return res.status(409).json({ success: false, error: `仍有 ${used.rows[0].n} 件作品使用此分類，請先改分類或刪除作品` })
    }
    await db().execute({ sql: 'DELETE FROM nico_series WHERE id = ?', args: [req.params.id] })
    res.json({ success: true, message: '分類已刪除' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤' })
  }
}
