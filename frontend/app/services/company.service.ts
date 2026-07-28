// app/services/company.service.ts
import apiClient from './api'

export const CompanyService = {
  async getProfile() {
    return apiClient.get('/enterprise/profile')
  },

  async updateProfile(body: any) {
    return apiClient.put('/enterprise/profile', body)
  }
}
