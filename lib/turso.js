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

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

module.exports = { db, toWork, setCors }
