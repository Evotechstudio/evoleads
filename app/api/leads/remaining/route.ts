import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Get or create user plan
    let { data: userPlan } = await (supabase as any)
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If no plan exists, create a free plan
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
      return NextResponse.json(
        { error: 'Failed to get user plan' },
        { status: 500 }
      );
    }

    // Define plan limits
    const planLimits = {
      free: { leads_per_month: 20, search_requests: 2 },
      starter: { leads_per_month: 250, search_requests: 50 }
    };

    const currentPlan = planLimits[userPlan.plan_name as keyof typeof planLimits] || planLimits.free;
    const remaining = Math.max(0, currentPlan.leads_per_month - userPlan.leads_used);

    return NextResponse.json({
      remaining,
      total: currentPlan.leads_per_month,
      used: userPlan.leads_used,
      plan: userPlan.plan_name
    });

  } catch (error) {
    console.error('Error fetching remaining leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
