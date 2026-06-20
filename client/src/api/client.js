import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

client.interceptors.request.use(config => {
  try {
    const token = localStorage.getItem('nico_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {}
  return config
})

client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      try { localStorage.removeItem('nico_token') } catch {}
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export default client
