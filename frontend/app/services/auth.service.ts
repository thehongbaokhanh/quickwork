import apiClient from './api'

// Định nghĩa Service xử lý các nghiệp vụ Xác thực
export const AuthService = {
  async login(payload: any) {
    const config = useRuntimeConfig()
    return apiClient.post(`${config.public.apiBase}/auth/login`, payload)
  },

  async register(payload: any) {
    const config = useRuntimeConfig()
    return apiClient.post(`${config.public.apiBase}/auth/register`, payload)
  },

  async forgotPassword(email: string) {
    const config = useRuntimeConfig()
    return apiClient.post(`${config.public.apiBase}/auth/forgot-password`, { email })
  }
}