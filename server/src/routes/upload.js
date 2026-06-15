const express = require('express')
const { uploadImageHandler, deleteImageHandler } = require('../controllers/uploadController')
const authMiddleware = require('../middleware/auth')
const upload = require('../middleware/upload')

const router = express.Router()

// 包住 multer，把錯誤（檔案過大/格式錯誤）轉成友善訊息
function uploadSingle(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? '圖片超過 20MB 上限' : err.message
      return res.status(400).json({ success: false, error: msg, code: 'UPLOAD_ERROR' })
    }
    next()
  })
}

router.post('/image', authMiddleware, uploadSingle, uploadImageHandler)
router.delete('/image/:pid', authMiddleware, deleteImageHandler)

module.exports = router
