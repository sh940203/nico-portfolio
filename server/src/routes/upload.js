const express = require('express')
const { uploadImageHandler, deleteImageHandler } = require('../controllers/uploadController')
const authMiddleware = require('../middleware/auth')
const upload = require('../middleware/upload')

const router = express.Router()

router.post('/image', authMiddleware, upload.single('image'), uploadImageHandler)
router.delete('/image/:pid', authMiddleware, deleteImageHandler)

module.exports = router
