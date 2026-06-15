const { put, del } = require('@vercel/blob')

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN

// 上傳圖片至 Vercel Blob（公開 CDN URL），回傳 { url, publicId }
async function uploadImage(buffer, originalname = 'image', contentType = 'image/jpeg') {
  const safe = originalname.replace(/[^\w.\-]/g, '_')
  const key = `nico/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`
  const blob = await put(key, buffer, { access: 'public', contentType, token: TOKEN })
  // 以 url 作為 publicId（刪除時 del 接受 url）
  return { url: blob.url, publicId: blob.url }
}

// 刪除 Blob 圖片（傳入 url 或 publicId）
async function deleteImage(urlOrId) {
  if (!urlOrId) return
  if (!/^https?:\/\//.test(urlOrId)) return // 舊的本地路徑不刪
  try {
    await del(urlOrId, { token: TOKEN })
  } catch (err) {
    console.error('Blob 刪除失敗:', err.message)
  }
}

module.exports = { uploadImage, deleteImage }
