import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return NextResponse.json({ 
        message: 'Profile already exists',
        profile: existingProfile 
      })
    }

    // Create profile (simplified schema)
    const { data: profileData, error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email: user.emailAddresses[0]?.emailAddress || '',
      full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
    }).select()

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return NextResponse.json({ 
        error: 'Failed to create profile',
        details: profileError 
      }, { status: 500 })
    }

    // Create user plan
    const { data, error } = await (supabase as any).from('user_plans').insert({
      user_id: userId,
      plan_name: 'free',
      search_requests_used: 0,
      leads_used: 0,
    }).select()

    if (error) {
      console.error('Error creating profile:', error)
      return NextResponse.json({ 
        error: 'Failed to create profile',
        details: error 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Profile created successfully',
      profile: data[0]
    })
  } catch (error) {
    console.error('Error in sync-user:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error 
    }, { status: 500 })
  }
}
