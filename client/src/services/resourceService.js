import api from '../lib/api.js'

export const resourceService = {
  getAllResources: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/api/resources?${params}`)
    return response.data.data
  },

  getResourceById: async (id) => {
    const response = await api.get(`/api/resources/${id}`)
    return response.data.data
  },

  createResource: async (resourceData) => {
    const response = await api.post('/api/resources', resourceData)
    return response.data.data
  },

  updateResource: async (id, resourceData) => {
    const response = await api.put(`/api/resources/${id}`, resourceData)
    return response.data.data
  },

  deleteResource: async (id) => {
    const response = await api.delete(`/api/resources/${id}`)
    return response.data
  },

  getAvailableResources: async (startDate, endDate, minAvailability = 0) => {
    const response = await api.get('/api/resources/available', {
      params: { startDate, endDate, minAvailability }
    })
    return response.data.data
  },

  getResourceAllocations: async (id) => {
    const response = await api.get(`/api/resources/${id}/allocations`)
    return response.data.data
  },

  getUtilization: async (startDate, endDate) => {
    const response = await api.get('/api/resources/utilization', {
      params: { startDate, endDate }
    })
    return response.data.data
  }
}
