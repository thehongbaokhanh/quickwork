import apiClient from './api'

export const StudentService = {
  async getProfile() {
    const config = useRuntimeConfig()
    return apiClient.get(`${config.public.apiBase}/student/profile`)
  },

  async updateProfile(payload: any) {
    const config = useRuntimeConfig()
    return apiClient.put(`${config.public.apiBase}/student/profile`, payload)
  },

  async getAppliedJobs() {
    const config = useRuntimeConfig()
    return apiClient.get(`${config.public.apiBase}/student/applied-jobs`)
  }
}