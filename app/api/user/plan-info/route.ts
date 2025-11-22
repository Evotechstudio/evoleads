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

    // Get or create user plan
    let { data: userPlan } = await (supabase as any)
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!userPlan) {
      const { data: newPlan } = await (supabase as any)
        .from('user_plans')
        .insert({
          user_id: userId,
          plan_name: 'free',
          search_requests_used: 0,
          leads_used: 0
        })
        .select()
        .single();
      
      userPlan = newPlan;
    }

    if (!userPlan) {
      return NextResponse.json({ error: 'Failed to get user plan' }, { status: 500 });
    }

    const planLimits = {
      free: { leads_per_month: 20, search_requests: 2 },
      starter: { leads_per_month: 250, search_requests: 50 }
    };

    const currentPlan = planLimits[userPlan.plan_name as keyof typeof planLimits] || planLimits.free;

    return NextResponse.json({
      plan: userPlan.plan_name,
      leadsUsed: userPlan.leads_used,
      leadsAvailable: currentPlan.leads_per_month - userPlan.leads_used,
      leadsTotal: currentPlan.leads_per_month,
      requestsUsed: userPlan.search_requests_used,
      requestsRemaining: currentPlan.search_requests - userPlan.search_requests_used,
      requestsTotal: currentPlan.search_requests,
      canMakeRequest: userPlan.search_requests_used < currentPlan.search_requests,
      canGenerateLeads: userPlan.leads_used < currentPlan.leads_per_month
    });

  } catch (error) {
    console.error('Error fetching plan info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
