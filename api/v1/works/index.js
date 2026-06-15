const { db, toWork, setCors } = require('../../../lib/turso')

module.exports = async (req, res) => {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })

  try {
    const { category, series, page = 1, limit = 12, featured } = req.query
    const conditions = ['is_visible = 1']
    const args = []
    if (category) { conditions.push('category = ?'); args.push(category) }
    if (series) { conditions.push('series = ?'); args.push(series) }
    if (featured === 'true') { conditions.push('is_featured = 1') }

    const where = 'WHERE ' + conditions.join(' AND ')
    const countResult = await db().execute({ sql: `SELECT COUNT(*) AS n FROM nico_works ${where}`, args })
    const total = Number(countResult.rows[0].n)
    const offset = (Number(page) - 1) * Number(limit)

    const result = await db().execute({
      sql: `SELECT * FROM nico_works ${where} ORDER BY display_order ASC, created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, Number(limit), offset],
    })

    res.status(200).json({
      success: true,
      data: result.rows.map(toWork),
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
  }
}
