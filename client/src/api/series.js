import client from './client'

export const getSeries = (category) => client.get('/series', { params: category ? { category } : {} })
export const createSeries = (data) => client.post('/series', data)
export const updateSeries = (id, data) => client.put(`/series/${id}`, data)
export const deleteSeries = (id) => client.delete(`/series/${id}`)
