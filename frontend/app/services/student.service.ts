import apiClient from './api'

export const StudentService = {
  async getProfile() {
    return apiClient.get('/student/profile')
  },

  async updateProfile(payload: any) {
    return apiClient.put('/student/profile', payload)
  },

  async uploadProfileFile(file: File, kind: 'avatar' | 'cv') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('kind', kind)
    return apiClient.post('/student/profile/upload', formData)
  },

  async getSkills() {
    return apiClient.get('/student/skills')
  },

  async createSkill(payload: { name: string; category_id?: number; category_name?: string }) {
    return apiClient.post('/student/skills', payload)
  },

  async createWorkExperience(payload: any) {
    return apiClient.post('/student/profile/experiences', payload)
  },

  async updateWorkExperience(id: string | number, payload: any) {
    return apiClient.put(`/student/profile/experiences/${id}`, payload)
  },

  async deleteWorkExperience(id: string | number) {
    return apiClient.delete(`/student/profile/experiences/${id}`)
  },

  async createEducation(payload: any) {
    return apiClient.post('/student/profile/educations', payload)
  },

  async updateEducation(id: string | number, payload: any) {
    return apiClient.put(`/student/profile/educations/${id}`, payload)
  },

  async deleteEducation(id: string | number) {
    return apiClient.delete(`/student/profile/educations/${id}`)
  },

  async createPortfolio(payload: { title: string; url: string }) {
    return apiClient.post('/student/profile/portfolios', payload)
  },

  async updatePortfolio(id: string | number, payload: { title: string; url: string }) {
    return apiClient.put(`/student/profile/portfolios/${id}`, payload)
  },

  async deletePortfolio(id: string | number) {
    return apiClient.delete(`/student/profile/portfolios/${id}`)
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

  async getJobRecommendations(limit = 20, refresh = false) {
    const refreshQuery = refresh ? '&refresh=true' : ''
    return apiClient.get(`/student/job-recommendations?limit=${limit}${refreshQuery}`)
  },

  async getCareerGuidance(payload: {
    goal: string
    article_title: string
    article_category: string
    article_excerpt: string
    article_highlights: string[]
  }) {
    return apiClient.post('/student/career-guidance', payload)
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
