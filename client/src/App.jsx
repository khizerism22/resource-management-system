import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import UserManagement from './pages/UserManagement.jsx'
import ProjectList from './pages/ProjectList.jsx'
import ProjectDetails from './pages/ProjectDetails.jsx'
import CreateProject from './pages/CreateProject.jsx'
import ResourceList from './pages/ResourceList.jsx'
import ResourceAllocation from './pages/ResourceAllocation.jsx'
import CapacityView from './pages/CapacityView.jsx'
import SprintManagement from './pages/SprintManagement.jsx'
import SprintHealthReport from './pages/SprintHealthReport.jsx'
import ProjectDashboard from './pages/ProjectDashboard.jsx'
import PortfolioDashboard from './pages/PortfolioDashboard.jsx'
import Reports from './pages/Reports.jsx'
import Alerts from './pages/Alerts.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/users"
        element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/create"
        element={
          <ProtectedRoute>
            <CreateProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/sprints"
        element={
          <ProtectedRoute>
            <SprintManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sprints/:sprintId/health"
        element={
          <ProtectedRoute>
            <SprintHealthReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <ResourceList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources/:id/allocations"
        element={
          <ProtectedRoute>
            <ResourceAllocation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/allocations"
        element={
          <ProtectedRoute>
            <ResourceAllocation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/capacity"
        element={
          <ProtectedRoute>
            <CapacityView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/project/:id"
        element={
          <ProtectedRoute>
            <ProjectDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/portfolio"
        element={
          <ProtectedRoute>
            <PortfolioDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <Alerts />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
