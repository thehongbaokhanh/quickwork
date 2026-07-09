import apiClient from './api'

export const AdminService = {
  async getDashboardStats() {
    return apiClient.get('/admin/dashboard/stats')
  },
  async getUsers(params?: any) {
    return apiClient.get('/admin/users', { query: params })
  },
  async getStudents(params?: any) {
    return apiClient.get('/admin/students', { query: params })
  },
  async getEnterprises(params?: any) {
    return apiClient.get('/admin/enterprises', { query: params })
  },
  async getRecentUsers(limit = 5) {
    return apiClient.get('/admin/users/recent', { query: { limit } })
  },
  async getPendingJobs(params?: any) {
    return apiClient.get('/admin/jobs', { query: params })
  },
  async updateUserStatus(id: string | number, status: 'ACTIVE' | 'INACTIVE' | 'BANNED') {
    return apiClient.put(`/admin/users/${id}/status`, { status })
  },
  async updateEnterpriseKYB(id: string | number, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return apiClient.put(`/admin/enterprises/${id}/kyb`, { status })
  },
  async requestEnterpriseGPKD(id: string | number) {
    return apiClient.post(`/admin/enterprises/${id}/request-gpkd`)
  },
  async reviewJob(id: string | number, body: { status: 'APPROVED' | 'REJECTED'; reject_reason?: string }) {
    return apiClient.put(`/admin/jobs/${id}/review`, body)
  }
}
