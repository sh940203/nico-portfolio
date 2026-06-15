import client from './client'

export const sendMessage = (data) => client.post('/contact', data)
export const getMessages = (params) => client.get('/contact', { params })
export const markAsRead = (id) => client.patch(`/contact/${id}/read`)
export const deleteMessage = (id) => client.delete(`/contact/${id}`)
