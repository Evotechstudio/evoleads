'use client'

import React from 'react'
import { OAuthButton } from './oauth-button'
import { useAuth } from '../../lib/auth/auth-context'
import { AlertCircle, X } from 'lucide-react'

export function SignInForm() {
  const { error, clearError, loading } = useAuth()

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to Evo Lead AI
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your account to get started
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={clearError}
            className="shrink-0 text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-3">
        <OAuthButton provider="google" disabled={loading} />
        <OAuthButton provider="github" disabled={loading} />
      </div>

      <div className="text-center text-xs text-gray-500">
        By signing in, you agree to our{' '}
        <a href="/terms" className="text-blue-600 hover:text-blue-800">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-blue-600 hover:text-blue-800">
          Privacy Policy
        </a>
      </div>
    </div>
  )
}