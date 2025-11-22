import { supabase } from '../supabase'
import type { UserResource } from '@clerk/types'

export async function syncClerkUserToSupabase(clerkUser: UserResource) {
  try {
    // Check if user already exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', clerkUser.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Error checking existing user:', fetchError)
      return null
    }

    if (existingUser) {
      // User exists, update their information
      const { data: updatedUser, error: updateError } = await supabase
        .from('profiles')
        .update({
          email: clerkUser.primaryEmailAddress?.emailAddress || existingUser.email,
          full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || existingUser.full_name,
          avatar_url: clerkUser.imageUrl || existingUser.avatar_url,
        })
        .eq('id', clerkUser.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user:', updateError)
        return null
      }

      return updatedUser
    } else {
      // Create new user in Supabase
      const { data: newUser, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
          avatar_url: clerkUser.imageUrl || null,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating user:', insertError)
        return null
      }

      // Create a default organization for the new user
      await createDefaultOrganization(clerkUser.id, clerkUser.firstName || 'User')

      return newUser
    }
  } catch (error) {
    console.error('Error syncing user:', error)
    return null
  }
}

async function createDefaultOrganization(userId: string, userName: string) {
  try {
    // Create default organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: `${userName}'s Organization`,
        owner_id: userId,
        plan: 'trial',
        credits: 0,
        trial_searches_used: 0,
      })
      .select()
      .single()

    if (orgError) {
      console.error('Error creating default organization:', orgError)
      return
    }

    // Add user as owner to organization_members
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        user_id: userId,
        role: 'owner',
      })

    if (memberError) {
      console.error('Error adding user to organization:', memberError)
    }
  } catch (error) {
    console.error('Error creating default organization:', error)
  }
}