import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type LeadTag = Database['public']['Tables']['lead_tags']['Row']
type LeadTagInsert = Database['public']['Tables']['lead_tags']['Insert']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: tags, error } = await supabase
      .from('lead_tags')
      .select(`
        *,
        lead_tag_assignments (
          id,
          lead_id
        )
      `)
      .eq('organization_id', organizationId)
      .order('name')

    if (error) {
      console.error('Error fetching lead tags:', error)
      return NextResponse.json(
        { error: 'Failed to fetch lead tags' },
        { status: 500 }
      )
    }

    // Add usage count to each tag
    const tagsWithCount = tags?.map(tag => ({
      ...tag,
      usage_count: tag.lead_tag_assignments?.length || 0
    })) || []

    return NextResponse.json({ tags: tagsWithCount })
  } catch (error) {
    console.error('Error in lead tags API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      organizationId,
      userId,
      name,
      color = '#3B82F6',
      description
    } = body

    if (!organizationId || !userId || !name) {
      return NextResponse.json(
        { error: 'Organization ID, User ID, and name are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Check if tag name already exists in organization
    const { data: existingTag } = await supabase
      .from('lead_tags')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('name', name)
      .single()

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag name already exists in this organization' },
        { status: 409 }
      )
    }

    // Create new tag
    const tagData: LeadTagInsert = {
      organization_id: organizationId,
      name,
      color,
      description,
      created_by: userId
    }

    const { data: tag, error } = await supabase
      .from('lead_tags')
      .insert(tagData)
      .select()
      .single()

    if (error) {
      console.error('Error creating lead tag:', error)
      return NextResponse.json(
        { error: 'Failed to create lead tag' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      tag: { ...tag, usage_count: 0 },
      message: 'Lead tag created successfully' 
    })
  } catch (error) {
    console.error('Error in lead tags POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
