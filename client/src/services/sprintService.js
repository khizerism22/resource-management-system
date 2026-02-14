import api from '../lib/api.js'

export const sprintService = {
  createSprint: async (projectId, sprintData) => {
    const response = await api.post(`/api/projects/${projectId}/sprints`, sprintData)
    return response.data.data
  },

  getProjectSprints: async (projectId, filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/api/projects/${projectId}/sprints?${params}`)
    return response.data
  },

  getSprintById: async (id) => {
    const response = await api.get(`/api/sprints/${id}`)
    return response.data.data
  },

  updateSprint: async (id, sprintData) => {
    const response = await api.put(`/api/sprints/${id}`, sprintData)
    return response.data.data
  },

  deleteSprint: async (id) => {
    const response = await api.delete(`/api/sprints/${id}`)
    return response.data
  },

  getSprintStatus: async (id) => {
    const response = await api.get(`/api/sprints/${id}/status`)
    return response.data.data
  }
}
