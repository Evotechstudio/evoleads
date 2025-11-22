'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/sign-in?error=callback_error')
          return
        }

        if (data.session) {
          // Successful authentication, redirect to dashboard
          router.push('/dashboard')
        } else {
          // No session found, redirect to sign-in
          router.push('/auth/sign-in')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/auth/sign-in?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}