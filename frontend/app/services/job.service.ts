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
  },

  async getEnterpriseJobs(params?: any) {
    const config = useRuntimeConfig()
    return apiClient.get(`${config.public.apiBase}/enterprise/jobs`, { query: params })
  },

  async createEnterpriseJob(body: any) {
    const config = useRuntimeConfig()
    return apiClient.post(`${config.public.apiBase}/enterprise/jobs`, body)
  },

  async updateEnterpriseJob(id: string | number, body: any) {
    const config = useRuntimeConfig()
    return apiClient.put(`${config.public.apiBase}/enterprise/jobs/${id}`, body)
  },

  async deleteEnterpriseJob(id: string | number) {
    const config = useRuntimeConfig()
    return apiClient.delete(`${config.public.apiBase}/enterprise/jobs/${id}`)
  }
}