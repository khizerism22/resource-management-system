import { useMediaQuery, useTheme } from '@mui/material'

export function useResponsive() {
  const theme = useTheme()
  return {
    isMobile: useMediaQuery(theme.breakpoints.down('sm')),
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')),
    isDesktop: useMediaQuery(theme.breakpoints.up('md')),
    isSmallScreen: useMediaQuery(theme.breakpoints.down('md'))
  }
}

export function getResponsiveSpacing(mobile, tablet, desktop) {
  return {
    xs: mobile,
    sm: tablet,
    md: desktop
  }
}

export function getResponsiveColumns(mobile = 12, tablet = 6, desktop = 4) {
  return {
    xs: mobile,
    sm: tablet,
    md: desktop
  }
}
