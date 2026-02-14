import { useEffect, useMemo, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import AppShell from '../components/AppShell.jsx'
import { userService } from '../services/userService.js'
import UserModal from '../components/UserModal.jsx'
import './UserManagement.css'

const ROLE_OPTIONS = ['Admin', 'PM', 'TeamLead', 'Stakeholder']

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [roleFilter])

  async function fetchUsers() {
    setLoading(true)
    try {
      const filters = {}
      if (roleFilter) filters.role = roleFilter
      if (searchTerm) filters.search = searchTerm

      const data = await userService.getAllUsers(filters)
      setUsers(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    fetchUsers()
  }

  function handleCreate() {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  function handleEdit(row) {
    setEditingUser(row)
    setIsModalOpen(true)
  }

  async function handleSave(userData) {
    if (editingUser) {
      await userService.updateUser(editingUser._id, userData)
    } else {
      await userService.createUser(userData)
    }
    setIsModalOpen(false)
    fetchUsers()
  }

  async function handleDelete(userId) {
    await userService.deleteUser(userId)
    setDeleteConfirm(null)
    fetchUsers()
  }

  async function handleRoleChange(userId, newRole) {
    await userService.changeUserRole(userId, newRole)
    fetchUsers()
  }

  const rows = useMemo(
    () =>
      users.map((u) => ({
        ...u,
        id: u._id
      })),
    [users]
  )

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 220 },
    {
      field: 'role',
      headerName: 'Role',
      flex: 0.6,
      minWidth: 140,
      renderCell: (params) => (
        <select
          className="role-select"
          value={params.value}
          onChange={(e) => handleRoleChange(params.row._id, e.target.value)}
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role === 'TeamLead' ? 'Team Lead' : role}
            </option>
          ))}
        </select>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      flex: 0.6,
      minWidth: 140,
      valueGetter: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      minWidth: 140,
      renderCell: (params) => (
        <div className="actions">
          <button className="btn-icon" onClick={() => handleEdit(params.row)} title="Edit">
            Edit
          </button>
          <button
            className="btn-icon btn-danger"
            onClick={() => setDeleteConfirm(params.row)}
            title="Delete"
          >
            Delete
          </button>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <AppShell title="User Management">
        <div>Loading users...</div>
      </AppShell>
    )
  }
  if (error) {
    return (
      <AppShell title="User Management">
        <div className="error">{error}</div>
      </AppShell>
    )
  }

  return (
    <AppShell title="User Management">
      <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          + Add User
        </button>
      </div>

      <div className="filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="form-select"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="PM">PM</option>
          <option value="TeamLead">Team Lead</option>
          <option value="Stakeholder">Stakeholder</option>
        </select>
      </div>

      <div className="table-container">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          autoHeight
        />
        {rows.length === 0 && <div className="empty-state">No users found</div>}
      </div>

      {isModalOpen && (
        <UserModal
          user={editingUser}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
            </p>
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
