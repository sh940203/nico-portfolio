import client from './client'

export const login = (credentials) => client.post('/auth/login', credentials)
export const verify = () => client.get('/auth/verify')
