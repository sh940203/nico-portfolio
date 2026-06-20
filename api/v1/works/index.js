const { randomUUID } = require('crypto')
const { db, toWork, setCors } = require('../../../lib/turso')
const { verifyToken } = require('../../../lib/verifyToken')

module.exports = async (req, res) => {
  setCors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  // ── GET（公開）──
  if (req.method === 'GET') {
    try {
      const { category, series, featured } = req.query
      const page  = Math.max(1, parseInt(req.query.page, 10) || 1)
      const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 12))
      const conditions = ['is_visible = 1']
      const args = []
      if (category) { conditions.push('category = ?'); args.push(category) }
      if (series)   { conditions.push('series = ?');   args.push(series) }
      if (featured === 'true') { conditions.push('is_featured = 1') }

      const where = 'WHERE ' + conditions.join(' AND ')
      const countResult = await db().execute({ sql: `SELECT COUNT(*) AS n FROM nico_works ${where}`, args })
      const total = Number(countResult.rows[0].n)
      const offset = (page - 1) * limit

      const result = await db().execute({
        sql: `SELECT * FROM nico_works ${where} ORDER BY display_order ASC, created_at DESC LIMIT ? OFFSET ?`,
        args: [...args, limit, offset],
      })

      return res.status(200).json({
        success: true,
        data: result.rows.map(toWork),
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
    }
  }

  // ── POST（新增，需驗證）──
  if (req.method === 'POST') {
    if (!verifyToken(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' })
    }
    try {
      const { title, category, series, year, medium, description, coverImage, detailImages = [], displayOrder = 0, isVisible = true, isFeatured = false } = req.body
      if (!title || !category || !year || !coverImage?.url || !coverImage?.publicId) {
        return res.status(400).json({ success: false, error: '缺少必填欄位', code: 'VALIDATION_ERROR' })
      }

      const id = randomUUID()
      const now = Math.floor(Date.now() / 1000)
      await db().execute({
        sql: `INSERT INTO nico_works (id, title, category, series, year, medium, description, cover_image_url, cover_image_public_id, cover_image_width, cover_image_height, detail_images, display_order, is_visible, is_featured, created_at, updated_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [id, title, category, series || null, year, medium || null, description || null, coverImage.url, coverImage.publicId, coverImage.width || null, coverImage.height || null, JSON.stringify(detailImages), displayOrder, isVisible ? 1 : 0, isFeatured ? 1 : 0, now, now],
      })

      const result = await db().execute({ sql: 'SELECT * FROM nico_works WHERE id = ?', args: [id] })
      return res.status(201).json({ success: true, data: toWork(result.rows[0]), message: '作品建立成功' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}
