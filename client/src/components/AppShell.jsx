import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import ProjectPickerModal from './ProjectPickerModal.jsx'
import './AppShell.css'

export default function AppShell({ title, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">RM</div>
          <div className="brand-text">
            <div className="brand-title">ResourceOps</div>
            <div className="brand-sub">Health Console</div>
          </div>
        </div>

        <nav className="nav-list">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => (isActive ? 'active' : '')}>
            Projects
          </NavLink>
          <button className="nav-button" onClick={() => setIsPickerOpen(true)}>
            Sprints
          </button>
          <NavLink to="/dashboard/portfolio" className={({ isActive }) => (isActive ? 'active' : '')}>
            Portfolio Dashboard
          </NavLink>
          <NavLink to="/resources" className={({ isActive }) => (isActive ? 'active' : '')}>
            Resources
          </NavLink>
          <NavLink to="/allocations" className={({ isActive }) => (isActive ? 'active' : '')}>
            Allocations
          </NavLink>
          <NavLink to="/capacity" className={({ isActive }) => (isActive ? 'active' : '')}>
            Capacity
          </NavLink>
          {user?.role === 'Admin' ? (
            <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : '')}>
              User Management
            </NavLink>
          ) : null}
        </nav>

        <div className="sidebar-footer">
          <div className="user-meta">
            <div className="avatar">{user?.name?.[0] || 'U'}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <div className="title">{title}</div>
            <div className="subtitle">Welcome back, {user?.name}</div>
          </div>
          <div className="topbar-actions">
            <div className="pill">{user?.role}</div>
          </div>
        </header>
        <section className="page-body">{children}</section>
      </main>
      <ProjectPickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(projectId) => {
          setIsPickerOpen(false)
          navigate(`/projects/${projectId}/sprints`)
        }}
      />
    </div>
  )
}
