import apiClient from './api'

// Định nghĩa Service xử lý các nghiệp vụ Xác thực
export const AuthService = {

  async login(payload: any) {
    return await apiClient.post("/auth/login", payload);
  },

  async googleLogin(code: string) {
    return await apiClient.post('/auth/google', { code })
  },

  async logout() {
    return await apiClient.post("/auth/logout", undefined, {
      credentials: 'include',
    });
  },

  async changePassword(payload: any) {
    return apiClient.post('/auth/change-password', payload)
  },
    
  async registerStudent(payload: any) {
    const config = useRuntimeConfig()
    return apiClient.post(`${config.public.apiBase}/auth/register-student`, payload)
  },

  async registerEnterprise(payload: any) {
    const config = useRuntimeConfig()
    return apiClient.post(`${config.public.apiBase}/auth/register-enterprise`, payload)
  },

  async uploadGPKD(file: File, kind: 'gpkd' | 'logo' | 'cover' = 'gpkd') {
    const formData = new FormData()
    formData.append('gpkd', file)
    formData.append('kind', kind)
    const config = useRuntimeConfig()
    return apiClient.post(`${config.public.apiBase}/auth/upload`, formData)
  },

  async forgotPassword(email: string) {
    const config = useRuntimeConfig()
    return apiClient.post(`${config.public.apiBase}/auth/forgot-password`, { email })
  }
}
