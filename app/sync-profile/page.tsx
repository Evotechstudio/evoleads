'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@clerk/nextjs'

export default function SyncProfilePage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/sync-user', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to sync profile')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError('An error occurred while syncing profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Sync Your Profile</CardTitle>
          <CardDescription>
            Manually sync your Clerk user account to the Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            </div>
          )}

          <Button 
            onClick={handleSync} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Syncing...' : 'Sync Profile to Database'}
          </Button>

          {result && (
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-semibold">
                {result.message}
              </p>
              {result.profile && (
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(result.profile, null, 2)}
                </pre>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 font-semibold">
                {error}
              </p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Next Steps:
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>Click the button above to sync your profile</li>
              <li>Check your Supabase dashboard to verify the profile was created</li>
              <li>Set up Clerk webhooks for automatic syncing (see CLERK_SUPABASE_SETUP.md)</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
