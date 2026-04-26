import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// Attach access token dari cookie httpOnly tidak bisa — pakai memory store via Zustand
// Token di-set oleh auth store setelah login
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = sessionStorage.getItem('access_token')
    if (raw) config.headers.Authorization = `Bearer ${raw}`
  }
  // Hapus Content-Type untuk FormData — axios set otomatis beserta boundary-nya
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

let isRefreshing = false
let queue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(api(original))
        })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const refreshToken = sessionStorage.getItem('refresh_token')
      if (!refreshToken) throw new Error('no refresh token')

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'}/auth/refresh`,
        { refresh_token: refreshToken }
      )

      const newToken: string = data.data.access_token
      sessionStorage.setItem('access_token', newToken)
      if (data.data.refresh_token) {
        sessionStorage.setItem('refresh_token', data.data.refresh_token)
      }

      queue.forEach((cb) => cb(newToken))
      queue = []

      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch {
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('refresh_token')
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
