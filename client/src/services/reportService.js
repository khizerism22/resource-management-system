import api from '../lib/api.js'

export const reportService = {
  getSprintSuccessTrend: async (projectId, startDate, endDate) => {
    const response = await api.get(`/api/reports/sprint-success-trend/${projectId}`, {
      params: { startDate, endDate }
    })
    return response.data
  },

  getScrumMaturityTrend: async (projectId, startDate, endDate) => {
    const response = await api.get(`/api/reports/scrum-maturity-trend/${projectId}`, {
      params: { startDate, endDate }
    })
    return response.data
  },

  getResourceUtilization: async (startDate, endDate) => {
    const response = await api.get('/api/reports/resource-utilization', {
      params: { startDate, endDate }
    })
    return response.data
  },

  getRecurringFailures: async (startDate, endDate, minOccurrences = 2) => {
    const response = await api.get('/api/reports/recurring-failures', {
      params: { startDate, endDate, minOccurrences }
    })
    return response.data
  },

  downloadCSV: async (reportPath, params) => {
    const response = await api.get(`/api${reportPath}`, {
      params: { ...params, format: 'csv' },
      responseType: 'blob'
    })
    return response.data
  }
}
