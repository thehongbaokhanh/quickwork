// app/services/company.service.ts
import apiClient from './api'

export const CompanyService = {
  async getProfile() {
    const config = useRuntimeConfig()
    return apiClient.get(`${config.public.apiBase}/company/profile`)
  }
}