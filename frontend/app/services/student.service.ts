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
    return apiClient.get('/student/applied-jobs')
  },

  async getFavoriteJobs() {
    return apiClient.get('/student/favorite-jobs')
  },

  async getJobActions() {
    return apiClient.get('/student/job-actions')
  },

  async applyJob(id: string | number) {
    return apiClient.post(`/student/jobs/${id}/apply`)
  },

  async saveFavoriteJob(id: string | number) {
    return apiClient.post(`/student/jobs/${id}/favorite`)
  },

  async removeFavoriteJob(id: string | number) {
    return apiClient.delete(`/student/jobs/${id}/favorite`)
  }
}
