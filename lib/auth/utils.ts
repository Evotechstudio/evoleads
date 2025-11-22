import { AuthError } from '@supabase/supabase-js'

export function getAuthErrorMessage(error: AuthError | Error | unknown): string {
  if (!error) return 'An unknown error occurred'
  
  if (typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message
    
    // Map common Supabase auth errors to user-friendly messages
    switch (message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please try again.'
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link.'
      case 'User not found':
        return 'No account found with this email address.'
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.'
      case 'Unable to validate email address: invalid format':
        return 'Please enter a valid email address.'
      case 'Signup requires a valid password':
        return 'Please enter a valid password.'
      default:
        return message
    }
  }
  
  return 'An authentication error occurred'
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof Error && 'status' in error
}

export function getRedirectUrl(path: string = '/dashboard'): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }
  return path
}