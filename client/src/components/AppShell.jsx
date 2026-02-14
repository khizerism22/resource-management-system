import DashboardLayout from './DashboardLayout.jsx'

export default function AppShell({ title, children }) {
  return <DashboardLayout title={title}>{children}</DashboardLayout>
}
