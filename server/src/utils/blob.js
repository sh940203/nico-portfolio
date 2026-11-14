const { putObject, deleteByUrl } = require('../../../lib/r2')

// 上傳圖片至 Cloudflare R2（公開網址），回傳 { url, publicId }
async function uploadImage(buffer, originalname = 'image', contentType = 'image/jpeg') {
  const safe = originalname.replace(/[^\w.\-]/g, '_')
  const key = `nico/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`
  const url = await putObject(key, buffer, contentType)
  // 以 url 作為 publicId（刪除時依 url 判斷）
  return { url, publicId: url }
}

// 刪除圖片（傳入 url 或 publicId）；非 R2 的舊網址略過
async function deleteImage(urlOrId) {
  if (!urlOrId) return
  try {
    await deleteByUrl(urlOrId)
  } catch (err) {
    console.error('R2 刪除失敗:', err.message)
  }
}

module.exports = { uploadImage, deleteImage }
