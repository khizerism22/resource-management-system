import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme
} from '@mui/material'
import {
  Dashboard,
  People,
  Folder,
  PersonOutline,
  Speed,
  Assignment,
  BarChart,
  Notifications,
  ListAlt,
  Timeline
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext.jsx'

const DRAWER_WIDTH = 260

export default function Sidebar({ open, onClose, isMobile, onOpenSprints }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  const menuItems = useMemo(
    () => [
      { title: 'Dashboard', icon: <Dashboard />, path: '/', roles: ['Admin', 'PM', 'TeamLead', 'Stakeholder'] },
      { title: 'Portfolio', icon: <Timeline />, path: '/dashboard/portfolio', roles: ['Admin', 'PM', 'TeamLead'] },
      { title: 'Projects', icon: <Folder />, path: '/projects', roles: ['Admin', 'PM', 'TeamLead', 'Stakeholder'] },
      { title: 'Sprints', icon: <BarChart />, path: '/projects', roles: ['Admin', 'PM', 'TeamLead'], action: 'sprints' },
      { title: 'Resources', icon: <PersonOutline />, path: '/resources', roles: ['Admin', 'PM', 'TeamLead'] },
      { title: 'Allocations', icon: <Assignment />, path: '/allocations', roles: ['Admin', 'PM'] },
      { title: 'Capacity', icon: <Speed />, path: '/capacity', roles: ['Admin', 'PM'] },
      { title: 'Reports', icon: <ListAlt />, path: '/reports', roles: ['Admin', 'PM', 'TeamLead', 'Stakeholder'] },
      { title: 'Alerts', icon: <Notifications />, path: '/alerts', roles: ['Admin', 'PM', 'TeamLead', 'Stakeholder'] },
      { title: 'Users', icon: <People />, path: '/users', roles: ['Admin'] }
    ],
    []
  )

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.role))

  function handleNavigate(item) {
    if (item.action === 'sprints') {
      onOpenSprints?.()
      if (isMobile) onClose()
      return
    }
    navigate(item.path)
    if (isMobile) onClose()
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant="h5" fontWeight={700} color="primary">
          ResourceOps
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Health Console
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flex: 1, pt: 2 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigate(item)}
              selected={item.path !== '/' ? location.pathname.startsWith(item.path) : location.pathname === '/'}
              sx={{
                mx: 1.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: location.pathname.startsWith(item.path) ? 600 : 500
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Logged in as
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {user?.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.role}
        </Typography>
      </Box>
    </Box>
  )

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box'
            }
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`
            }
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  )
}
