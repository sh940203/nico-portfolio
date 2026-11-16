const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const { setCors } = require('../../../lib/turso')
const { verifyToken } = require('../../../lib/verifyToken')

function getS3() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  })
}

module.exports = async (req, res) => {
  setCors(req, res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (!verifyToken(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' })
  }

  const BUCKET = process.env.R2_BUCKET
  const PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')

  // ── POST：上傳圖片（接受 base64 JSON）──
  if (req.method === 'POST') {
    try {
      const { base64, filename = 'image', contentType = 'image/jpeg' } = req.body || {}
      if (!base64) return res.status(400).json({ success: false, error: '未提供圖片資料', code: 'NO_FILE' })

      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowed.includes(contentType)) {
        return res.status(400).json({ success: false, error: '不支援的圖片格式', code: 'INVALID_TYPE' })
      }

      const buffer = Buffer.from(base64, 'base64')
      if (buffer.byteLength > 20 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: '圖片超過 20MB 上限', code: 'FILE_TOO_LARGE' })
      }

      const safe = filename.replace(/[^\w.\-]/g, '_')
      const key = `nico/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`

      await getS3().send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }))

      const url = `${PUBLIC_URL}/${key}`
      return res.status(200).json({ success: true, data: { url, publicId: key } })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, error: '圖片上傳失敗', code: 'UPLOAD_ERROR' })
    }
  }

  // ── DELETE：刪除圖片 ──
  if (req.method === 'DELETE') {
    try {
      const { url } = req.body || {}
      if (url && PUBLIC_URL && url.startsWith(PUBLIC_URL + '/')) {
        const key = url.slice(PUBLIC_URL.length + 1)
        await getS3().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
      }
      return res.status(200).json({ success: true, message: '圖片已刪除' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, error: '圖片刪除失敗', code: 'DELETE_ERROR' })
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' })
}
