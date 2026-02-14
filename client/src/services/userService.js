import api from '../lib/api.js'

export const userService = {
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/api/users?${params}`)
    return response.data.data
  },

  getUserById: async (id) => {
    const response = await api.get(`/api/users/${id}`)
    return response.data.data
  },

  createUser: async (userData) => {
    const response = await api.post('/api/users', userData)
    return response.data.data
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/api/users/${id}`, userData)
    return response.data.data
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/api/users/${id}`)
    return response.data
  },

  changeUserRole: async (id, role) => {
    const response = await api.put(`/api/users/${id}/role`, { role })
    return response.data.data
  }
}
