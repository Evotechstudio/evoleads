import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

interface LeadGenerationRequest {
  businessType: string;
  country: string;
  state: string;
  city?: string;
  leadsCount: number;
}

interface SerperPlace {
  position: number;
  title: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  ratingCount?: number;
  category?: string;
  phoneNumber?: string;
  website?: string;
  cid?: string;
}

interface ScrapedLead {
  business_name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  rating?: number;
  review_count?: number;
  category?: string;
  google_maps_url?: string;
  place_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: any = await request.json();
    console.log('API received body:', body);
    
    const leadsCount = body.leadsCount || body.leadsRequested;
    const { businessType, country, state, city } = body;

    if (!businessType || !country || !state || !leadsCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check user plan and limits
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

    if (userPlan.leads_used + leadsCount > currentPlan.leads_per_month) {
      return NextResponse.json(
        { error: 'Monthly lead limit exceeded', remaining: currentPlan.leads_per_month - userPlan.leads_used },
        { status: 403 }
      );
    }

    // Check for existing searches in the same location to calculate offset
    const { data: existingSearches } = await supabase
      .from('user_searches')
      .select('id')
      .eq('user_id', userId)
      .eq('business_type', businessType)
      .eq('country', country)
      .eq('state', state)
      .eq('city', city || '')
      .eq('status', 'completed');

    const searchOffset = (existingSearches?.length || 0) * leadsCount;

    // Create search record
    const { data: searchRecord, error: searchError } = await supabase
      .from('user_searches')
      .insert({
        user_id: userId,
        business_type: businessType,
        country,
        state,
        city: city || '',
        leads_requested: leadsCount,
        status: 'processing'
      })
      .select()
      .single();

    if (searchError || !searchRecord) {
      return NextResponse.json({ error: 'Failed to create search record' }, { status: 500 });
    }

    // Get existing lead names to avoid duplicates
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('business_name')
      .in('search_id', existingSearches?.map(s => s.id) || []);

    const existingBusinessNames = new Set(
      existingLeads?.map(l => l.business_name.toLowerCase().trim()) || []
    );

    // Scrape leads using Serper.dev with offset
    const leads = await scrapeLeadsWithSerper(
      businessType, 
      country, 
      state, 
      city, 
      leadsCount,
      searchOffset,
      existingBusinessNames
    );

    console.log(`Generated ${leads.length} leads for user ${userId}`);

    // Save leads to database
    if (leads.length > 0) {
      const leadsToInsert = leads.map(lead => ({
        search_id: searchRecord.id,
        business_name: lead.business_name,
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        confidence_score: lead.email ? 0.9 : (lead.phone ? 0.7 : 0.5)
      }));

      const { data: insertedLeads, error: leadsError } = await supabase
        .from('leads')
        .insert(leadsToInsert)
        .select();

      if (leadsError) {
        console.error('Error inserting leads:', leadsError);
      }

      // Save metadata
      if (insertedLeads) {
        const metadataToInsert = insertedLeads
          .map((lead, index) => {
            const sourceLead = leads[index];
            if (!sourceLead) return null;
            return {
              lead_id: lead.id,
              address: sourceLead.address,
              city: sourceLead.city,
              state: sourceLead.state,
              rating: sourceLead.rating,
              review_count: sourceLead.review_count,
              google_maps_url: sourceLead.google_maps_url,
              place_id: sourceLead.place_id,
            };
          })
          .filter((m): m is NonNullable<typeof m> => m !== null && (!!m.address || !!m.rating));

        if (metadataToInsert.length > 0) {
          const { error: metadataError } = await supabase.from('lead_metadata').insert(metadataToInsert);
          if (metadataError) {
            console.error('Error inserting lead metadata:', metadataError);
          } else {
            console.log(`Inserted ${metadataToInsert.length} lead metadata records`);
          }
        }
      }
    }

    // Update user plan usage
    await (supabase as any)
      .from('user_plans')
      .update({
        search_requests_used: userPlan.search_requests_used + 1,
        leads_used: userPlan.leads_used + leads.length
      })
      .eq('user_id', userId);

    // Update search status
    await supabase
      .from('user_searches')
      .update({ status: 'completed' })
      .eq('id', searchRecord.id);

    return NextResponse.json({
      success: true,
      searchId: searchRecord.id,
      leadsFound: leads.length,
      leadsRequested: leadsCount,
      leads: leads,
      remaining: currentPlan.leads_per_month - (userPlan.leads_used + leads.length)
    });

  } catch (error) {
    console.error('Lead generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    );
  }
}

async function scrapeLeadsWithSerper(
  businessType: string,
  country: string,
  state: string,
  city?: string,
  maxLeads: number = 10,
  offset: number = 0,
  existingBusinessNames: Set<string> = new Set()
): Promise<ScrapedLead[]> {
  const leads: ScrapedLead[] = [];
  
  try {
    // Build search query
    const location = city ? `${city}, ${state}, ${country}` : `${state}, ${country}`;
    const searchQuery = `${businessType} in ${location}`;
    
    console.log(`Searching with Serper: ${searchQuery} (offset: ${offset})`);

    // Calculate how many results to fetch (need more to account for duplicates)
    const fetchCount = Math.min(maxLeads * 3, 60);

    // Call Serper.dev Google Maps API with page parameter for pagination
    const page = Math.floor(offset / 20) + 1; // Serper returns ~20 results per page
    
    const response = await fetch('https://google.serper.dev/maps', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: searchQuery,
        num: fetchCount,
        page: page // Add pagination
      })
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    const data = await response.json();
    const places: SerperPlace[] = data.places || [];

    console.log(`Serper returned ${places.length} places (page ${page})`);

    // Calculate which results to use based on offset
    const startIndex = offset % 20; // Offset within the current page
    const availablePlaces = places.slice(startIndex);

    // Process each place, skipping duplicates
    for (const place of availablePlaces) {
      if (leads.length >= maxLeads) break;

      // Skip if we already have this business
      const normalizedName = place.title.toLowerCase().trim();
      if (existingBusinessNames.has(normalizedName)) {
        console.log(`Skipping duplicate: ${place.title}`);
        continue;
      }
      let email: string | undefined;
      
      // Try to get email from website
      if (place.website) {
        try {
          email = await extractEmailFromWebsite(place.website);
        } catch (error) {
          console.log(`Could not extract email from ${place.website}`);
        }
      }

      const lead: ScrapedLead = {
        business_name: place.title,
        email: email,
        phone: place.phoneNumber,
        website: place.website,
        address: place.address,
        city: city,
        state: state,
        rating: place.rating,
        review_count: place.ratingCount,
        category: place.category,
        google_maps_url: place.cid ? `https://www.google.com/maps?cid=${place.cid}` : undefined,
        place_id: place.cid
      };

      leads.push(lead);
      console.log(`✓ Added lead: ${place.title} (${place.category || 'No category'})`);
    }

  } catch (error) {
    console.error('Error in scrapeLeadsWithSerper:', error);
  }

  console.log(`Total leads found: ${leads.length}`);
  return leads;
}

async function extractEmailFromWebsite(websiteUrl: string): Promise<string | undefined> {
  try {
    // Try main page
    const response = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) return undefined;

    const html = await response.text();
    
    // Extract emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?!jpeg|jpg|png|gif|webp|svg|css|js)[a-zA-Z]{2,}/gi;
    const emails = [...new Set(html.match(emailRegex) || [])]
      .filter(email => 
        !email.includes('example.com') &&
        !email.includes('test.com') &&
        !email.includes('placeholder') &&
        !email.includes('wixpress') &&
        !email.includes('sentry')
      );

    return emails[0];
  } catch (error) {
    return undefined;
  }
}
