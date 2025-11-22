'use client'

import { useEffect } from 'react'
import { setupGlobalErrorHandling } from '../lib/hooks/use-error-handler'

export function ErrorSetup() {
  useEffect(() => {
    setupGlobalErrorHandling()
  }, [])

  return null
}