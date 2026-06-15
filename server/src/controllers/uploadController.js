const { uploadImage, deleteImage } = require('../utils/blob')

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

exports.deleteImageHandler = async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.pid)
    await deleteImage(publicId)
    res.json({ success: true, message: '圖片已刪除' })
  } catch (err) {
    res.status(500).json({ success: false, error: '圖片刪除失敗', code: 'DELETE_ERROR' })
  }
}
