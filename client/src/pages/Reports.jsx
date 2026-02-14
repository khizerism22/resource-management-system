import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import { reportService } from '../services/reportService.js'
import { projectService } from '../services/projectService.js'
import { exportToExcel, exportToPDF, downloadCSVBlob } from '../utils/exportUtils.js'
import SprintSuccessReport from '../components/reports/SprintSuccessReport.jsx'
import ScrumMaturityReport from '../components/reports/ScrumMaturityReport.jsx'
import ResourceUtilizationReport from '../components/reports/ResourceUtilizationReport.jsx'
import RecurringFailuresReport from '../components/reports/RecurringFailuresReport.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './Reports.css'

const REPORT_TYPES = [
  { value: 'sprint-success', label: 'Sprint Success Trend', requiresProject: true, roles: ['Admin', 'PM', 'TeamLead', 'Stakeholder'] },
  { value: 'scrum-maturity', label: 'Scrum Maturity Trend', requiresProject: true, roles: ['Admin', 'PM', 'TeamLead', 'Stakeholder'] },
  { value: 'resource-utilization', label: 'Resource Utilization', requiresProject: false, roles: ['Admin', 'PM'] },
  { value: 'recurring-failures', label: 'Recurring Failure Analysis', requiresProject: false, roles: ['Admin', 'PM', 'TeamLead'] }
]

export default function Reports() {
  const { user } = useAuth()
  const [reportType, setReportType] = useState('')
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [minOccurrences, setMinOccurrences] = useState(2)
  const [reportData, setReportData] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const availableReports = useMemo(() => {
    if (!user?.role) return []
    return REPORT_TYPES.filter((report) => report.roles.includes(user.role))
  }, [user])

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const data = await projectService.getAllProjects({})
      setProjects(data)
    } catch {
      setProjects([])
    }
  }

  async function handleGenerate() {
    if (!reportType) {
      setError('Please select a report type.')
      return
    }

    const selectedReport = availableReports.find((report) => report.value === reportType)
    if (selectedReport?.requiresProject && !selectedProject) {
      setError('Please select a project.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let response

      if (reportType === 'sprint-success') {
        response = await reportService.getSprintSuccessTrend(selectedProject, dateRange.startDate, dateRange.endDate)
      } else if (reportType === 'scrum-maturity') {
        response = await reportService.getScrumMaturityTrend(selectedProject, dateRange.startDate, dateRange.endDate)
      } else if (reportType === 'resource-utilization') {
        response = await reportService.getResourceUtilization(dateRange.startDate, dateRange.endDate)
      } else if (reportType === 'recurring-failures') {
        response = await reportService.getRecurringFailures(dateRange.startDate, dateRange.endDate, minOccurrences)
      }

      setReportData(response?.data || [])
      setSummary(response?.summary || null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  function handleExportExcel() {
    if (!reportData || reportData.length === 0) return
    const report = availableReports.find((item) => item.value === reportType)
    const filename = `${reportType}-${new Date().toISOString().split('T')[0]}`
    exportToExcel(reportData, report?.label || 'Report', filename)
  }

  function handleExportPDF() {
    if (!reportData || reportData.length === 0) return
    const report = availableReports.find((item) => item.value === reportType)
    const filename = `${reportType}-${new Date().toISOString().split('T')[0]}`
    exportToPDF(reportData, report?.label || 'Report', summary, filename)
  }

  async function handleExportCSV() {
    if (!reportData || reportData.length === 0) return

    let endpoint = ''
    const params = { ...dateRange }

    if (reportType === 'sprint-success') {
      endpoint = `/reports/sprint-success-trend/${selectedProject}`
    } else if (reportType === 'scrum-maturity') {
      endpoint = `/reports/scrum-maturity-trend/${selectedProject}`
    } else if (reportType === 'resource-utilization') {
      endpoint = '/reports/resource-utilization'
    } else if (reportType === 'recurring-failures') {
      endpoint = '/reports/recurring-failures'
      params.minOccurrences = minOccurrences
    }

    try {
      const blob = await reportService.downloadCSV(endpoint, params)
      const filename = `${reportType}-${new Date().toISOString().split('T')[0]}`
      downloadCSVBlob(blob, filename)
    } catch {
      setError('Failed to download CSV')
    }
  }

  const currentReport = availableReports.find((report) => report.value === reportType)

  return (
    <AppShell title="Reports & Analytics">
      <div className="reports-page">
        <div className="page-header">
          <div>
            <h1>Reports & Analytics</h1>
            <p className="page-subtitle">Generate insight-rich reports with one click.</p>
          </div>
        </div>

        <div className="report-config">
          <div className="config-header">
            <h3>Report Configuration</h3>
            <button className="btn btn-secondary" onClick={() => {
              setReportType('')
              setSelectedProject('')
              setReportData(null)
              setSummary(null)
              setError(null)
            }}>
              Reset
            </button>
          </div>

          <div className="config-grid">
            <div className="form-group">
              <label className="form-label">Report Type *</label>
              <select
                value={reportType}
                onChange={(event) => {
                  setReportType(event.target.value)
                  setReportData(null)
                  setSummary(null)
                  setError(null)
                }}
                className="form-select"
              >
                <option value="">Select Report Type</option>
                {availableReports.map((report) => (
                  <option key={report.value} value={report.value}>
                    {report.label}
                  </option>
                ))}
              </select>
            </div>

            {currentReport?.requiresProject && (
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select
                  value={selectedProject}
                  onChange={(event) => setSelectedProject(event.target.value)}
                  className="form-select"
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name} - {project.client}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(event) => setDateRange({ ...dateRange, startDate: event.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(event) => setDateRange({ ...dateRange, endDate: event.target.value })}
                className="form-input"
              />
            </div>

            {reportType === 'recurring-failures' && (
              <div className="form-group">
                <label className="form-label">Minimum Occurrences</label>
                <input
                  type="number"
                  min="1"
                  value={minOccurrences}
                  onChange={(event) => setMinOccurrences(Number(event.target.value))}
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <button className="btn btn-primary btn-block" onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {reportData && (
          <div className="report-results">
            <div className="export-actions">
              <button className="btn btn-secondary" onClick={handleExportPDF}>
                Export PDF
              </button>
              <button className="btn btn-secondary" onClick={handleExportExcel}>
                Export Excel
              </button>
              <button className="btn btn-secondary" onClick={handleExportCSV}>
                Export CSV
              </button>
            </div>

            <div className="report-display">
              {reportType === 'sprint-success' && <SprintSuccessReport data={reportData} summary={summary} />}
              {reportType === 'scrum-maturity' && <ScrumMaturityReport data={reportData} summary={summary} />}
              {reportType === 'resource-utilization' && <ResourceUtilizationReport data={reportData} summary={summary} />}
              {reportType === 'recurring-failures' && <RecurringFailuresReport data={reportData} summary={summary} />}
            </div>
          </div>
        )}

        {!reportData && !loading && (
          <div className="empty-state">
            <p>Select a report type and generate insights for leadership reviews.</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
