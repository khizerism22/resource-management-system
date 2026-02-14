import api from '../lib/api.js'

export const sprintHealthService = {
  createSprintHealth: async (sprintId, healthData) => {
    const response = await api.post(`/api/sprints/${sprintId}/health`, healthData)
    return response.data.data
  },

  getSprintHealth: async (sprintId) => {
    const response = await api.get(`/api/sprints/${sprintId}/health`)
    return response.data
  },

  updateSprintHealth: async (sprintId, healthData) => {
    const response = await api.put(`/api/sprints/${sprintId}/health`, healthData)
    return response.data.data
  },

  getHealthHistory: async (sprintId) => {
    const response = await api.get(`/api/sprints/${sprintId}/health/history`)
    return response.data.data
  }
}
