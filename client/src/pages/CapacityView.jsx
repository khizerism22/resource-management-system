import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import UtilizationChart from '../components/UtilizationChart.jsx'
import CapacityCalendar from '../components/CapacityCalendar.jsx'
import { resourceService } from '../services/resourceService.js'
import { allocationService } from '../services/allocationService.js'
import './CapacityView.css'

export default function CapacityView() {
  const [utilizationData, setUtilizationData] = useState([])
  const [resources, setResources] = useState([])
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchUtilization()
    fetchResourcesAndAllocations()
  }, [dateRange])

  async function fetchUtilization() {
    setLoading(true)
    try {
      const data = await resourceService.getUtilization(dateRange.startDate, dateRange.endDate)
      setUtilizationData(data)
    } catch {
      setUtilizationData([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchResourcesAndAllocations() {
    try {
      const [resourceData, allocationData] = await Promise.all([
        resourceService.getAllResources(),
        allocationService.getAllAllocations()
      ])
      setResources(resourceData)
      setAllocations(allocationData)
    } catch {
      setResources([])
      setAllocations([])
    }
  }

  if (loading) {
    return (
      <AppShell title="Capacity">
        <div>Loading capacity data...</div>
      </AppShell>
    )
  }

  const avgUtilization =
    utilizationData.length > 0
      ? Math.round(
          utilizationData.reduce((sum, r) => sum + r.utilizationPercentage, 0) /
            utilizationData.length
        )
      : 0

  return (
    <AppShell title="Capacity">
      <div className="capacity-view">
        <div className="page-header">
          <h1>Resource Capacity</h1>
          <div className="date-controls">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="form-input"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <div className="capacity-stats">
          <div className="stat-card">
            <div className="stat-value">
              {utilizationData.filter((r) => r.utilizationPercentage < 80).length}
            </div>
            <div className="stat-label">Available Resources</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {utilizationData.filter((r) => r.overAllocated).length}
            </div>
            <div className="stat-label">Over-Allocated</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{avgUtilization}%</div>
            <div className="stat-label">Avg Utilization</div>
          </div>
        </div>

        <div className="card">
          <h2>Utilization Chart</h2>
          <UtilizationChart data={utilizationData} />
        </div>

        <div className="card">
          <CapacityCalendar resources={resources} allocations={allocations} />
        </div>

        <div className="card">
          <h2>Resource Details</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Role</th>
                  <th>Utilization</th>
                  <th>Allocations</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {utilizationData.map((resource) => (
                  <tr key={resource.resourceId} className={resource.overAllocated ? 'over-allocated' : ''}>
                    <td>{resource.name}</td>
                    <td>{resource.role}</td>
                    <td>
                      <div className="utilization-bar-container">
                        <div
                          className="utilization-bar"
                          style={{
                            width: `${Math.min(resource.utilizationPercentage, 100)}%`,
                            backgroundColor: resource.overAllocated
                              ? 'var(--danger)'
                              : resource.utilizationPercentage > 80
                                ? 'var(--warning)'
                                : 'var(--success)'
                          }}
                        />
                        <span>{resource.utilizationPercentage}%</span>
                      </div>
                    </td>
                    <td>{resource.allocationsCount}</td>
                    <td>
                      <span
                        className={`badge ${
                          resource.overAllocated
                            ? 'badge-red'
                            : resource.utilizationPercentage > 80
                              ? 'badge-amber'
                              : 'badge-green'
                        }`}
                      >
                        {resource.overAllocated
                          ? 'Over-allocated'
                          : resource.utilizationPercentage > 80
                            ? 'High'
                            : 'Available'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
