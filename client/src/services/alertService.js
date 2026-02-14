import api from '../lib/api.js'

export const alertService = {
  getUserAlerts: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/api/alerts?${params}`)
    return response.data
  },

  getUnreadCount: async () => {
    const response = await api.get('/api/alerts/unread-count')
    return response.data.count
  },

  markAsRead: async (id) => {
    const response = await api.put(`/api/alerts/${id}/read`)
    return response.data
  },

  markAllAsRead: async () => {
    const response = await api.put('/api/alerts/mark-all-read')
    return response.data
  },

  archiveAlert: async (id) => {
    const response = await api.put(`/api/alerts/${id}/archive`)
    return response.data
  },

  deleteAlert: async (id) => {
    const response = await api.delete(`/api/alerts/${id}`)
    return response.data
  }
}
