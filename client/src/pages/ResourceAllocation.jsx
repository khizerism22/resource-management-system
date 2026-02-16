import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import AllocationForm from '../components/AllocationForm.jsx'
import { allocationService } from '../services/allocationService.js'
import { useAuth } from '../context/AuthContext.jsx'
import './ResourceAllocation.css'

export default function ResourceAllocation() {
  const [allocations, setAllocations] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAllocation, setEditingAllocation] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [draftPercentages, setDraftPercentages] = useState({})

  const { user } = useAuth()
  const { id } = useParams()
  const location = useLocation()

  useEffect(() => {
    fetchAllocations()
    checkConflicts()
  }, [id, location.key])

  async function fetchAllocations() {
    setLoading(true)
    try {
      setError(null)
      let data = []
      if (id) {
        data = await allocationService.getAllAllocations({ resourceId: id })
      } else {
        data = await allocationService.getAllAllocations()
      }
      setAllocations(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load allocations')
    } finally {
      setLoading(false)
    }
  }

  async function checkConflicts() {
    try {
      const data = await allocationService.checkConflicts()
      setConflicts(data.data || [])
    } catch {
      // ignore
    }
  }

  async function handleSave(allocationData) {
    if (editingAllocation) {
      await allocationService.updateAllocation(editingAllocation._id, allocationData)
    } else {
      await allocationService.createAllocation(allocationData)
    }
    setIsFormOpen(false)
    setEditingAllocation(null)
    fetchAllocations()
    checkConflicts()
  }

  async function handleDelete(id) {
    await allocationService.deleteAllocation(id)
    setDeleteConfirm(null)
    fetchAllocations()
    checkConflicts()
  }

  async function handleInlineSave(allocationId) {
    const nextValue = draftPercentages[allocationId]
    if (nextValue === undefined || nextValue === null) return
    await allocationService.updateAllocation(allocationId, {
      allocationPercentage: Number(nextValue)
    })
    setDraftPercentages((prev) => {
      const copy = { ...prev }
      delete copy[allocationId]
      return copy
    })
    fetchAllocations()
    checkConflicts()
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const canManage = user?.role === 'PM' || user?.role === 'Admin'

  if (loading) {
    return (
      <AppShell title="Allocations">
        <div>Loading allocations...</div>
      </AppShell>
    )
  }
  if (error) {
    return (
      <AppShell title="Allocations">
        <div className="error">{error}</div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Allocations">
      <div className="resource-allocation">
        <div className="page-header">
          <div>
            <h1>Resource Allocations</h1>
            <p className="page-subtitle">{allocations.length} total allocations</p>
          </div>
          {canManage && (
            <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
              + New Allocation
            </button>
          )}
        </div>

        {conflicts.length > 0 && (
          <div className="alert alert-error">
            <strong>{conflicts.length} Over-allocation Conflicts Detected</strong>
            <ul>
              {conflicts.map((conflict, idx) => (
                <li key={idx}>
                  {conflict.resourceName}: {conflict.totalAllocated}% allocated (capacity {conflict.capacity}%)
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Resource</th>
                <th>Role</th>
                <th>Project</th>
                <th>Allocation %</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {allocations.map((allocation) => {
                const isOverdue = new Date(allocation.endDate) < new Date()
                const isCurrent =
                  new Date(allocation.startDate) <= new Date() &&
                  new Date(allocation.endDate) >= new Date()

                return (
                  <tr key={allocation._id} className={isOverdue ? 'overdue' : ''}>
                    <td>{allocation.resource?.name}</td>
                    <td>{allocation.resource?.role}</td>
                    <td>{allocation.project?.name}</td>
                  <td>
                    <div className="percentage-cell">
                      {canManage ? (
                        <>
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={draftPercentages[allocation._id] ?? allocation.allocationPercentage}
                            onChange={(e) =>
                              setDraftPercentages((prev) => ({
                                ...prev,
                                [allocation._id]: e.target.value
                              }))
                            }
                            className="allocation-slider"
                          />
                          <span>
                            {draftPercentages[allocation._id] ?? allocation.allocationPercentage}%
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="percentage-bar-small">
                            <div
                              className="percentage-fill"
                              style={{
                                width: `${allocation.allocationPercentage}%`,
                                backgroundColor:
                                  allocation.allocationPercentage > 80
                                    ? 'var(--warning)'
                                    : 'var(--primary)'
                              }}
                            />
                          </div>
                          <span>{allocation.allocationPercentage}%</span>
                        </>
                      )}
                    </div>
                  </td>
                    <td>{formatDate(allocation.startDate)}</td>
                    <td>{formatDate(allocation.endDate)}</td>
                    <td>
                      <span className={`badge ${isCurrent ? 'badge-green' : isOverdue ? 'badge-gray' : 'badge-amber'}`}>
                        {isCurrent ? 'Active' : isOverdue ? 'Completed' : 'Upcoming'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="actions">
                        {draftPercentages[allocation._id] &&
                        Number(draftPercentages[allocation._id]) !==
                          Number(allocation.allocationPercentage) ? (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleInlineSave(allocation._id)}
                            title="Save"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            className="btn-icon"
                            onClick={() => {
                              setEditingAllocation(allocation)
                              setIsFormOpen(true)
                            }}
                            title="Edit"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => setDeleteConfirm(allocation)}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>

          {allocations.length === 0 && <div className="empty-state">No allocations found</div>}
        </div>

        {isFormOpen && (
          <AllocationForm
            allocation={editingAllocation}
            onSave={handleSave}
            onClose={() => {
              setIsFormOpen(false)
              setEditingAllocation(null)
            }}
          />
        )}

        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Delete</h3>
              <p>Delete this allocation?</p>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
