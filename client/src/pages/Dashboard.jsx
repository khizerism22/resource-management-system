import AppShell from '../components/AppShell.jsx'

export default function Dashboard() {
  return (
    <AppShell title="Dashboard">
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-label">Active Projects</div>
          <div className="stat-value">3</div>
          <div className="stat-sub">+1 this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Team Utilization</div>
          <div className="stat-value">82%</div>
          <div className="stat-sub">Healthy range</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sprints at Risk</div>
          <div className="stat-value">1</div>
          <div className="stat-sub">Down from 2</div>
        </div>
      </div>

      <div className="panel-row">
        <div className="panel">
          <h3>Delivery Health</h3>
          <p>Track outcome status and Scrum maturity across the last 5 sprints.</p>
          <button className="btn btn-primary">View Reports</button>
        </div>
        <div className="panel">
          <h3>Resource Overview</h3>
          <p>Quickly spot overallocation and upcoming capacity constraints.</p>
          <button className="btn btn-secondary">Open Capacity</button>
        </div>
      </div>
    </AppShell>
  )
}
