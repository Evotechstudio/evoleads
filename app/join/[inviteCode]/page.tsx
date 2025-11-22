'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinOrganizationPage() {
  const router = useRouter()

  // Redirect to dashboard since this page uses old auth system
  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecting to dashboard...</p>
    </div>
  )
}