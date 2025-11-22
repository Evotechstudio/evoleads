'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()

  // Redirect to new Clerk sign-in page
  useEffect(() => {
    router.replace('/sign-in')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecting to sign in...</p>
    </div>
  )
}