const { db, toWork, setCors } = require('../../../lib/turso')
const { verifyToken } = require('../../../lib/verifyToken')
const { del } = require('@vercel/blob')

async function deleteBlob(urlOrId) {
  if (!urlOrId || !/^https?:\/\//.test(urlOrId)) return
  try { await del(urlOrId, { token: process.env.BLOB_READ_WRITE_TOKEN }) } catch {}
}

module.exports = async (req, res) => {
  setCors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const { id } = req.query

  // ── GET（公開）──
  if (req.method === 'GET') {
    try {
      const result = await db().execute({ sql: 'SELECT * FROM nico_works WHERE id = ?', args: [id] })
      if (!result.rows[0]) return res.status(404).json({ success: false, error: '作品不存在', code: 'NOT_FOUND' })
      return res.status(200).json({ success: true, data: toWork(result.rows[0]) })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
    }
  }

  // ── PUT / DELETE（需驗證）──
  if (req.method === 'PUT' || req.method === 'DELETE') {
    if (!verifyToken(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' })
    }

    if (req.method === 'PUT') {
      try {
        const { title, category, series, year, medium, description, coverImage, detailImages, displayOrder, isVisible, isFeatured } = req.body
        const now = Math.floor(Date.now() / 1000)
        const fields = []
        const args = []

        if (title !== undefined)               { fields.push('title = ?');                args.push(title) }
        if (category !== undefined)            { fields.push('category = ?');             args.push(category) }
        if (series !== undefined)              { fields.push('series = ?');               args.push(series) }
        if (year !== undefined)                { fields.push('year = ?');                 args.push(year) }
        if (medium !== undefined)              { fields.push('medium = ?');               args.push(medium) }
        if (description !== undefined)         { fields.push('description = ?');          args.push(description) }
        if (coverImage?.url !== undefined)     { fields.push('cover_image_url = ?');      args.push(coverImage.url) }
        if (coverImage?.publicId !== undefined){ fields.push('cover_image_public_id = ?');args.push(coverImage.publicId) }
        if (coverImage?.width !== undefined)   { fields.push('cover_image_width = ?');    args.push(coverImage.width) }
        if (coverImage?.height !== undefined)  { fields.push('cover_image_height = ?');   args.push(coverImage.height) }
        if (detailImages !== undefined)        { fields.push('detail_images = ?');        args.push(JSON.stringify(detailImages)) }
        if (displayOrder !== undefined)        { fields.push('display_order = ?');        args.push(displayOrder) }
        if (isVisible !== undefined)           { fields.push('is_visible = ?');           args.push(isVisible ? 1 : 0) }
        if (isFeatured !== undefined)          { fields.push('is_featured = ?');          args.push(isFeatured ? 1 : 0) }

        if (fields.length === 0) return res.status(400).json({ success: false, error: '無更新欄位', code: 'NO_FIELDS' })
        fields.push('updated_at = ?'); args.push(now)
        args.push(id)

        const upd = await db().execute({ sql: `UPDATE nico_works SET ${fields.join(', ')} WHERE id = ?`, args })
        if (upd.rowsAffected === 0) return res.status(404).json({ success: false, error: '作品不存在', code: 'NOT_FOUND' })

        const result = await db().execute({ sql: 'SELECT * FROM nico_works WHERE id = ?', args: [id] })
        return res.status(200).json({ success: true, data: toWork(result.rows[0]), message: '作品更新成功' })
      } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
      }
    }

    if (req.method === 'DELETE') {
      try {
        const result = await db().execute({ sql: 'SELECT * FROM nico_works WHERE id = ?', args: [id] })
        const work = result.rows[0]
        if (!work) return res.status(404).json({ success: false, error: '作品不存在', code: 'NOT_FOUND' })

        await db().execute({ sql: 'DELETE FROM nico_works WHERE id = ?', args: [id] })
        await deleteBlob(work.cover_image_public_id)
        const details = (() => { try { return JSON.parse(work.detail_images || '[]') } catch { return [] } })()
        for (const img of details) await deleteBlob(img.publicId)

        return res.status(200).json({ success: true, message: '作品已刪除' })
      } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
      }
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}
