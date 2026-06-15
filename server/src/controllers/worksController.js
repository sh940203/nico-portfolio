const { v4: uuidv4 } = require('uuid')
const { db } = require('../utils/db')
const { deleteImage } = require('../utils/blob')

function toWork(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    series: row.series,
    level: row.level,
    year: row.year,
    medium: row.medium,
    description: row.description,
    coverImage: {
      url: row.cover_image_url,
      publicId: row.cover_image_public_id,
      width: row.cover_image_width,
      height: row.cover_image_height,
    },
    detailImages: JSON.parse(row.detail_images || '[]'),
    displayOrder: row.display_order,
    isVisible: row.is_visible === 1,
    isFeatured: row.is_featured === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

exports.getWorks = async (req, res) => {
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

    res.json({
      success: true,
      data: result.rows.map(toWork),
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
  }
}

exports.getWork = async (req, res) => {
  try {
    const result = await db().execute({ sql: 'SELECT * FROM nico_works WHERE id = ?', args: [req.params.id] })
    if (!result.rows[0]) return res.status(404).json({ success: false, error: '作品不存在', code: 'NOT_FOUND' })
    res.json({ success: true, data: toWork(result.rows[0]) })
  } catch (err) {
    res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
  }
}

exports.createWork = async (req, res) => {
  try {
    const { title, category, series, year, medium, description, coverImage, detailImages = [], displayOrder = 0, isVisible = true, isFeatured = false } = req.body
    if (!title || !category || !year || !coverImage?.url || !coverImage?.publicId) {
      return res.status(400).json({ success: false, error: '缺少必填欄位', code: 'VALIDATION_ERROR' })
    }

    const id = uuidv4()
    const now = Math.floor(Date.now() / 1000)
    await db().execute({
      sql: `INSERT INTO nico_works (id, title, category, series, year, medium, description, cover_image_url, cover_image_public_id, cover_image_width, cover_image_height, detail_images, display_order, is_visible, is_featured, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [id, title, category, series || null, year, medium || null, description || null, coverImage.url, coverImage.publicId, coverImage.width || null, coverImage.height || null, JSON.stringify(detailImages), displayOrder, isVisible ? 1 : 0, isFeatured ? 1 : 0, now, now],
    })

    const result = await db().execute({ sql: 'SELECT * FROM nico_works WHERE id = ?', args: [id] })
    res.status(201).json({ success: true, data: toWork(result.rows[0]), message: '作品建立成功' })
  } catch (err) {
    console.error(err)
    res.status(400).json({ success: false, error: err.message, code: 'VALIDATION_ERROR' })
  }
}

exports.updateWork = async (req, res) => {
  try {
    const { title, category, series, year, medium, description, coverImage, detailImages, displayOrder, isVisible, isFeatured } = req.body
    const now = Math.floor(Date.now() / 1000)

    const fields = []
    const args = []

    if (title !== undefined) { fields.push('title = ?'); args.push(title) }
    if (category !== undefined) { fields.push('category = ?'); args.push(category) }
    if (series !== undefined) { fields.push('series = ?'); args.push(series) }
    if (year !== undefined) { fields.push('year = ?'); args.push(year) }
    if (medium !== undefined) { fields.push('medium = ?'); args.push(medium) }
    if (description !== undefined) { fields.push('description = ?'); args.push(description) }
    if (coverImage?.url !== undefined) { fields.push('cover_image_url = ?'); args.push(coverImage.url) }
    if (coverImage?.publicId !== undefined) { fields.push('cover_image_public_id = ?'); args.push(coverImage.publicId) }
    if (coverImage?.width !== undefined) { fields.push('cover_image_width = ?'); args.push(coverImage.width) }
    if (coverImage?.height !== undefined) { fields.push('cover_image_height = ?'); args.push(coverImage.height) }
    if (detailImages !== undefined) { fields.push('detail_images = ?'); args.push(JSON.stringify(detailImages)) }
    if (displayOrder !== undefined) { fields.push('display_order = ?'); args.push(displayOrder) }
    if (isVisible !== undefined) { fields.push('is_visible = ?'); args.push(isVisible ? 1 : 0) }
    if (isFeatured !== undefined) { fields.push('is_featured = ?'); args.push(isFeatured ? 1 : 0) }

    if (fields.length === 0) return res.status(400).json({ success: false, error: '無更新欄位', code: 'NO_FIELDS' })

    fields.push('updated_at = ?'); args.push(now)
    args.push(req.params.id)

    const updateResult = await db().execute({
      sql: `UPDATE nico_works SET ${fields.join(', ')} WHERE id = ?`,
      args,
    })
    if (updateResult.rowsAffected === 0) return res.status(404).json({ success: false, error: '作品不存在', code: 'NOT_FOUND' })

    const result = await db().execute({ sql: 'SELECT * FROM nico_works WHERE id = ?', args: [req.params.id] })
    res.json({ success: true, data: toWork(result.rows[0]), message: '作品更新成功' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
  }
}

exports.deleteWork = async (req, res) => {
  try {
    const result = await db().execute({ sql: 'SELECT * FROM nico_works WHERE id = ?', args: [req.params.id] })
    const work = result.rows[0]
    if (!work) return res.status(404).json({ success: false, error: '作品不存在', code: 'NOT_FOUND' })

    await db().execute({ sql: 'DELETE FROM nico_works WHERE id = ?', args: [req.params.id] })

    await deleteImage(work.cover_image_public_id)
    const details = JSON.parse(work.detail_images || '[]')
    for (const img of details) {
      await deleteImage(img.publicId)
    }

    res.json({ success: true, message: '作品已刪除' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
  }
}

exports.reorderWorks = async (req, res) => {
  try {
    const { orders } = req.body
    const stmts = orders.map(({ id, displayOrder }) => ({
      sql: 'UPDATE nico_works SET display_order = ? WHERE id = ?',
      args: [displayOrder, id],
    }))
    await db().batch(stmts, 'write')
    res.json({ success: true, message: '排序已更新' })
  } catch (err) {
    res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
  }
}
