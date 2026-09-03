import apiClient from './api'

export const NotificationService = {
  async list(params?: any) {
    return apiClient.get('/notifications', { query: params })
  },

  async unreadCount() {
    return apiClient.get('/notifications/unread-count')
  },

  async markAsRead(id: string | number) {
    return apiClient.put(`/notifications/${id}/read`)
  },

  async markAllAsRead() {
    return apiClient.put('/notifications/read-all')
  }
}
