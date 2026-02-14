import api from '../lib/api.js'

export const projectService = {
  getAllProjects: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/api/projects?${params}`)
    return response.data.data
  },

  getProjectById: async (id) => {
    const response = await api.get(`/api/projects/${id}`)
    return response.data.data
  },

  createProject: async (projectData) => {
    const response = await api.post('/api/projects', projectData)
    return response.data.data
  },

  updateProject: async (id, projectData) => {
    const response = await api.put(`/api/projects/${id}`, projectData)
    return response.data.data
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/api/projects/${id}`)
    return response.data
  },

  getProjectHealth: async (id) => {
    const response = await api.get(`/api/projects/${id}/health`)
    return response.data.data
  }
}
