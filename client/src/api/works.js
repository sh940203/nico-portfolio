import client from './client'

export const getWorks = (params) => client.get('/works', { params })
export const getWork = (id) => client.get(`/works/${id}`)
export const createWork = (data) => client.post('/works', data)
export const updateWork = (id, data) => client.put(`/works/${id}`, data)
export const deleteWork = (id) => client.delete(`/works/${id}`)
export const reorderWorks = (orders) => client.put('/works/reorder', { orders })

// 上傳前在瀏覽器端壓縮：縮到 maxSize px、轉 JPEG（避開 Vercel 4.5MB body 上限並縮小儲存）
// GIF 不壓縮（避免失去動畫），其餘一律轉 JPEG。
async function compressImage(file, maxSize = 2000, quality = 0.85) {
  if (file.type === 'image/gif') return { base64: await fileToBase64(file), contentType: file.type, filename: file.name }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  const img = await new Promise((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = reject
    el.src = dataUrl
  })

  let { width, height } = img
  if (width > maxSize || height > maxSize) {
    const scale = maxSize / Math.max(width, height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(img, 0, 0, width, height)
  const out = canvas.toDataURL('image/jpeg', quality)

  return {
    base64: out.split(',')[1],
    contentType: 'image/jpeg',
    filename: file.name.replace(/\.[^.]+$/, '') + '.jpg',
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 將 File 壓縮後以 base64 JSON 上傳，本地 / Vercel 皆相容
export const uploadImage = async (file) => {
  const { base64, filename, contentType } = await compressImage(file)
  return client.post('/upload', { base64, filename, contentType })
}

export const deleteImage = (url) =>
  client.delete('/upload', { data: { url } })
