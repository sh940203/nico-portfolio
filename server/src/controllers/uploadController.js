const { uploadImage, deleteImage } = require('../utils/blob')

// 舊版：multipart (multer)
exports.uploadImageHandler = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: '未提供圖片', code: 'NO_FILE' })
    const result = await uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype)
    res.json({ success: true, data: result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '圖片上傳失敗', code: 'UPLOAD_ERROR' })
  }
}

// 新版：base64 JSON（與 Vercel serverless 相容）
exports.uploadBase64Handler = async (req, res) => {
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

    const result = await uploadImage(buffer, filename, contentType)
    res.json({ success: true, data: result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '圖片上傳失敗', code: 'UPLOAD_ERROR' })
  }
}

exports.deleteImageHandler = async (req, res) => {
  try {
    // 支援 /image/:pid（舊） 和 body.url（新）
    const urlOrId = req.params?.pid
      ? decodeURIComponent(req.params.pid)
      : req.body?.url
    await deleteImage(urlOrId)
    res.json({ success: true, message: '圖片已刪除' })
  } catch (err) {
    res.status(500).json({ success: false, error: '圖片刪除失敗', code: 'DELETE_ERROR' })
  }
}
