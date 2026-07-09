// app/services/job.service.ts
import apiClient from './api'

export const JobService = {
  async getAllJobs(params?: any) {
    return apiClient.get('/jobs', { params })
  },
  
  async getJobDetail(id: string) {
    return apiClient.get(`/jobs/${id}`)
  },

  async getEnterpriseJobs(params?: any) {
    return apiClient.get('/enterprise/jobs', { query: params })
  },

  async createEnterpriseJob(body: any) {
    return apiClient.post('/enterprise/jobs', body)
  },

  async updateEnterpriseJob(id: string | number, body: any) {
    return apiClient.put(`/enterprise/jobs/${id}`, body)
  },

  async deleteEnterpriseJob(id: string | number) {
    return apiClient.delete(`/enterprise/jobs/${id}`)
  }
}
