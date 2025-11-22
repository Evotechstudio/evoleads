import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Log the error for debugging
  console.error('Auth error:', { error, errorDescription })

  // Redirect to sign-in page with error message
  const redirectUrl = new URL('/auth/sign-in', request.url)
  
  if (error) {
    redirectUrl.searchParams.set('error', error)
  }
  
  if (errorDescription) {
    redirectUrl.searchParams.set('error_description', errorDescription)
  }

  return NextResponse.redirect(redirectUrl)
}
