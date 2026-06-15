import client from './client'

export const getWorks = (params) => client.get('/works', { params })
export const getWork = (id) => client.get(`/works/${id}`)
export const createWork = (data) => client.post('/works', data)
export const updateWork = (id, data) => client.put(`/works/${id}`, data)
export const deleteWork = (id) => client.delete(`/works/${id}`)
export const reorderWorks = (orders) => client.put('/works/reorder', { orders })

export const uploadImage = (file) => {
  const form = new FormData()
  form.append('image', file)
  return client.post('/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const deleteImage = (pid) => client.delete(`/upload/image/${encodeURIComponent(pid)}`)
