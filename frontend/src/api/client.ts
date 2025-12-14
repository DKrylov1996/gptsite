import axios from 'axios'

const baseURL = '/api' //import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const api = axios.create({
  baseURL,
  withCredentials: false
})

const getToken = () => {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem('top10.albums.token')
}

api.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
