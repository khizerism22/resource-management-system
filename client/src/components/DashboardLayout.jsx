import { useState } from 'react'
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import ProjectPickerModal from './ProjectPickerModal.jsx'
import { useNavigate } from 'react-router-dom'

const DRAWER_WIDTH = 260

export default function DashboardLayout({ children, title }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const navigate = useNavigate()

  function handleDrawerToggle() {
    setMobileOpen((prev) => !prev)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header title={title} onMenuClick={handleDrawerToggle} drawerWidth={DRAWER_WIDTH} />

      <Sidebar
        open={mobileOpen}
        onClose={handleDrawerToggle}
        isMobile={isMobile}
        onOpenSprints={() => setIsPickerOpen(true)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
      </Box>

      <ProjectPickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(projectId) => {
          setIsPickerOpen(false)
          navigate(`/projects/${projectId}/sprints`)
        }}
      />
    </Box>
  )
}
