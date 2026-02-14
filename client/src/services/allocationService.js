import api from '../lib/api.js'

export const allocationService = {
  getAllAllocations: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/api/allocations?${params}`)
    return response.data.data
  },

  createAllocation: async (allocationData) => {
    const response = await api.post('/api/allocations', allocationData)
    return response.data.data
  },

  updateAllocation: async (id, allocationData) => {
    const response = await api.put(`/api/allocations/${id}`, allocationData)
    return response.data.data
  },

  deleteAllocation: async (id) => {
    const response = await api.delete(`/api/allocations/${id}`)
    return response.data
  },

  checkConflicts: async () => {
    const response = await api.get('/api/allocations/conflicts')
    return response.data
  }
}
