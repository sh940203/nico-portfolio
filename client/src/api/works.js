import client from './client'

export const getWorks = (params) => client.get('/works', { params })
export const getWork = (id) => client.get(`/works/${id}`)
export const createWork = (data) => client.post('/works', data)
export const updateWork = (id, data) => client.put(`/works/${id}`, data)
export const deleteWork = (id) => client.delete(`/works/${id}`)
export const reorderWorks = (orders) => client.put('/works/reorder', { orders })

// 將 File 轉成 base64 JSON 上傳，本地 / Vercel 皆相容
export const uploadImage = async (file) => {
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  return client.post('/upload', {
    base64,
    filename: file.name,
    contentType: file.type,
  })
}

export const deleteImage = (url) =>
  client.delete('/upload', { data: { url } })
