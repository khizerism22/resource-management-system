import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import ProjectForm from '../components/ProjectForm.jsx'
import { projectService } from '../services/projectService.js'
import './CreateProject.css'

export default function CreateProject() {
  const navigate = useNavigate()

  async function handleCreate(projectData) {
    const created = await projectService.createProject(projectData)
    navigate(`/projects/${created._id}`)
  }

  return (
    <AppShell title="Create Project">
      <div className="create-project">
        <div className="page-header">
          <button className="btn btn-secondary" onClick={() => navigate('/projects')}>
            ← Back to Projects
          </button>
        </div>

        <div className="card">
          <h1>Create New Project</h1>
          <ProjectForm onSubmit={handleCreate} onCancel={() => navigate('/projects')} />
        </div>
      </div>
    </AppShell>
  )
}
