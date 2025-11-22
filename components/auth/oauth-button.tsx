'use client'

import React from 'react'
import { Github, Chrome, Loader2 } from 'lucide-react'
import { useAuth } from '../../lib/auth/auth-context'
import { cn } from '../../lib/utils'

interface OAuthButtonProps {
  provider: 'google' | 'github'
  className?: string
  disabled?: boolean
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: Chrome,
    bgColor: 'bg-white hover:bg-gray-50',
    textColor: 'text-gray-900',
    borderColor: 'border-gray-300',
  },
  github: {
    name: 'GitHub',
    icon: Github,
    bgColor: 'bg-gray-900 hover:bg-gray-800',
    textColor: 'text-white',
    borderColor: 'border-gray-900',
  },
}

export function OAuthButton({ provider, className, disabled }: OAuthButtonProps) {
  const { signInWithOAuth, loading } = useAuth()
  const config = providerConfig[provider]
  const Icon = config.icon

  const handleClick = async () => {
    await signInWithOAuth(provider)
  }

  const isDisabled = disabled || loading

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        'flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      <span>
        {loading ? 'Signing in...' : `Continue with ${config.name}`}
      </span>
    </button>
  )
}