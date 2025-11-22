import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all user's searches
    const { data: searches } = await supabase
      .from('user_searches')
      .select('id')
      .eq('user_id', userId);

    const searchIds = searches?.map(s => s.id) || [];

    if (searchIds.length === 0) {
      return NextResponse.json({
        totalLeads: 0,
        totalSearches: 0,
        leadsWithEmail: 0,
        avgConfidence: 0
      });
    }

    // Get all leads for user's searches
    const { data: leads } = await supabase
      .from('leads')
      .select('email, confidence_score')
      .in('search_id', searchIds);

    const totalLeads = leads?.length || 0;
    const leadsWithEmail = leads?.filter(l => l.email).length || 0;
    const avgConfidence = leads && leads.length > 0
      ? Math.round((leads.reduce((sum, l) => sum + (l.confidence_score || 0), 0) / leads.length) * 100)
      : 0;

    return NextResponse.json({
      totalLeads,
      totalSearches: searchIds.length,
      leadsWithEmail,
      avgConfidence
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
