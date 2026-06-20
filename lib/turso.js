// Vercel serverless 共用：Turso 連線與 works 轉換
const { createClient } = require('@libsql/client')

let _client = null
function db() {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return _client
}

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean)

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
    detailImages: (() => { try { return JSON.parse(row.detail_images || '[]') } catch { return [] } })(),
    displayOrder: row.display_order,
    isVisible: row.is_visible === 1,
    isFeatured: row.is_featured === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function setCors(req, res) {
  const origin = req?.headers?.origin || ''
  const allowed = ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)
    ? origin || '*'
    : ''
  if (allowed) res.setHeader('Access-Control-Allow-Origin', allowed)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
}

module.exports = { db, toWork, setCors }
