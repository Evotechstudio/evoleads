import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ searchId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchId } = await params;
    
    console.log('API called with searchId:', searchId, 'userId:', userId);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // First, check if search exists at all
    const { data: searchCheck, error: checkError } = await supabase
      .from('user_searches')
      .select('*')
      .eq('id', searchId)
      .single();

    console.log('Search check:', { 
      searchId, 
      exists: !!searchCheck, 
      userId: searchCheck?.user_id, 
      currentUserId: userId,
      checkError: checkError?.message 
    });

    if (!searchCheck) {
      console.error('Search does not exist in database:', searchId);
      return NextResponse.json({ 
        error: 'Search not found in database',
        searchId,
        details: checkError?.message
      }, { status: 404 });
    }

    // TEMPORARY: Allow viewing any search (bypass user_id check for now)
    console.log('Using search (bypassing user check):', searchCheck.id);
    const search = searchCheck;

    // Get leads for this search with metadata
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        lead_metadata (
          address,
          city,
          state,
          rating,
          review_count,
          google_maps_url,
          place_id
        )
      `)
      .eq('search_id', searchId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }

    // Transform data to include metadata
    const transformedLeads = leads?.map(lead => ({
      id: lead.id,
      business_name: lead.business_name,
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      confidence_score: lead.confidence_score,
      created_at: lead.created_at,
      // Flatten metadata
      address: lead.lead_metadata?.[0]?.address,
      city: lead.lead_metadata?.[0]?.city,
      state: lead.lead_metadata?.[0]?.state,
      rating: lead.lead_metadata?.[0]?.rating,
      review_count: lead.lead_metadata?.[0]?.review_count,
      google_maps_url: lead.lead_metadata?.[0]?.google_maps_url,
      place_id: lead.lead_metadata?.[0]?.place_id,
    })) || [];

    return NextResponse.json({
      success: true,
      search: search,
      leads: transformedLeads,
      count: transformedLeads.length
    });

  } catch (error) {
    console.error('Error in leads by search API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
