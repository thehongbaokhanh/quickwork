// app/services/job.service.ts
import apiClient from './api'

export const JobService = {
  async getAllJobs(params?: any) {
    const config = useRuntimeConfig()
    return apiClient.get(`${config.public.apiBase}/jobs`, { params })
  },
  
  async getJobDetail(id: string) {
    const config = useRuntimeConfig()
    return apiClient.get(`${config.public.apiBase}/jobs/${id}`)
  }
}