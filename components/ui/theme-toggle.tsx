'use client'

import * as React from 'react'
import { DarkModeSwitch } from 'react-toggle-dark-mode'
import { useTheme } from '../theme/theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  // Sync with theme provider
  React.useEffect(() => {
    if (theme === 'dark') {
      setIsDarkMode(true)
    } else if (theme === 'light') {
      setIsDarkMode(false)
    } else {
      // For system theme, check actual preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(isDark)
    }
  }, [theme])

  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked)
    setTheme(checked ? 'dark' : 'light')
  }

  return (
    <DarkModeSwitch
      checked={isDarkMode}
      onChange={toggleDarkMode}
      size={24}
      moonColor="#3b82f6"
      sunColor="#f59e0b"
    />
  )
}

// Simple toggle version for mobile or minimal UI (same as main toggle now)
export function SimpleThemeToggle() {
  return <ThemeToggle />
}