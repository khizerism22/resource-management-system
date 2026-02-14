import api from '../lib/api.js'

export const dashboardService = {
  getProjectHealth: async (projectId) => {
    const response = await api.get(`/api/dashboard/project/${projectId}`)
    return response.data.data
  },

  getPortfolioDashboard: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/api/dashboard/portfolio?${params}`)
    return response.data
  },

  getProjectTrends: async (projectId, months = 6) => {
    const response = await api.get(`/api/dashboard/trends/${projectId}`, {
      params: { months }
    })
    return response.data.data
  }
}
