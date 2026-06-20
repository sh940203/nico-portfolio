const express = require('express')
const { uploadImageHandler, deleteImageHandler, uploadBase64Handler } = require('../controllers/uploadController')
const authMiddleware = require('../middleware/auth')
const upload = require('../middleware/upload')

const router = express.Router()

function uploadSingle(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? '圖片超過 20MB 上限' : err.message
      return res.status(400).json({ success: false, error: msg, code: 'UPLOAD_ERROR' })
    }
    next()
  })
}

// 新格式：base64 JSON（與 Vercel serverless 相容）
router.post('/', authMiddleware, uploadBase64Handler)
router.delete('/', authMiddleware, deleteImageHandler)

// 舊格式保留（multipart）
router.post('/image', authMiddleware, uploadSingle, uploadImageHandler)
router.delete('/image/:pid', authMiddleware, deleteImageHandler)

module.exports = router
