import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

interface LeadGenerationRequest {
  businessType: string;
  country: string;
  state: string;
  city?: string;
  leadsCount: number;
}

interface ScrapedLead {
  business_name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  rating?: number;
  review_count?: number;
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
    
    // Support both leadsCount and leadsRequested for backwards compatibility
    const leadsCount = body.leadsCount || body.leadsRequested;
    const { businessType, country, state, city } = body;

    // Validate input with detailed logging
    if (!businessType || !country || !state || !leadsCount) {
      console.error('Validation failed:', {
        businessType: !!businessType,
        country: !!country,
        state: !!state,
        leadsCount: !!leadsCount,
        receivedBody: body
      });
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: {
            businessType: !businessType ? 'missing' : 'ok',
            country: !country ? 'missing' : 'ok',
            state: !state ? 'missing' : 'ok',
            leadsCount: !leadsCount ? 'missing' : 'ok'
          }
        },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get or create user plan (simplified - no organizations)
    let { data: userPlan } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If no plan exists, create a free plan
    if (!userPlan) {
      const { data: newPlan } = await supabase
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

    // Check if user has exceeded limits
    if (userPlan.leads_used + leadsCount > currentPlan.leads_per_month) {
      return NextResponse.json(
        { 
          error: 'Monthly lead limit exceeded', 
          remaining: currentPlan.leads_per_month - userPlan.leads_used 
        },
        { status: 403 }
      );
    }

    if (userPlan.search_requests_used >= currentPlan.search_requests) {
      return NextResponse.json(
        { 
          error: 'Monthly search limit exceeded',
          remaining: 0
        },
        { status: 403 }
      );
    }

    // Create search record (organization_id is now optional)
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
      return NextResponse.json(
        { error: 'Failed to create search record' },
        { status: 500 }
      );
    }

    // Check cache first
    const cacheKey = `${businessType}-${country}-${state}-${city || ''}`.toLowerCase();
    const { data: cachedResults } = await supabase
      .from('serp_cache')
      .select('results, cached_at')
      .eq('search_query', cacheKey)
      .eq('country', country)
      .eq('business_type', businessType)
      .gt('expires_at', new Date().toISOString())
      .single();

    let leads: ScrapedLead[] = [];

    if (cachedResults && cachedResults.results) {
      // Use cached results
      leads = (cachedResults.results as any).leads || [];
      console.log(`Using ${leads.length} cached leads from ${cachedResults.cached_at}`);
    } else {
      // Scrape new leads
      leads = await scrapeLeads(businessType, country, state, city);

      // Cache the results
      await supabase.from('serp_cache').upsert({
        search_query: cacheKey,
        country,
        state,
        business_type: businessType,
        results: { leads },
        result_count: leads.length,
        cached_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Deduplicate against existing leads for this user
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('website, email, phone, user_searches!inner(user_id)')
      .eq('user_searches.user_id', userId);

    const existingSet = new Set(
      existingLeads?.map(l => `${l.website}-${l.email}-${l.phone}`) || []
    );

    const uniqueLeads = leads.filter(lead => {
      const key = `${lead.website}-${lead.email}-${lead.phone}`;
      return !existingSet.has(key);
    }).slice(0, leadsCount);

    // Insert leads into database (organization_id is now optional)
    const leadsToInsert = uniqueLeads.map(lead => ({
      search_id: searchRecord.id,
      business_name: lead.business_name,
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      confidence_score: lead.email ? 0.9 : 0.5
    }));

    const { data: insertedLeads, error: leadsError } = await supabase
      .from('leads')
      .insert(leadsToInsert)
      .select();

    if (leadsError) {
      console.error('Error inserting leads:', leadsError);
    }

    // Insert metadata for leads with additional info
    if (insertedLeads) {
      const metadataToInsert = insertedLeads
        .map((lead, index) => {
          const originalLead = uniqueLeads[index];
          if (!originalLead) return null;
          
          return {
            lead_id: lead.id,
            address: originalLead.address,
            rating: originalLead.rating,
            review_count: originalLead.review_count,
            google_maps_url: originalLead.google_maps_url,
            place_id: originalLead.place_id
          };
        })
        .filter(Boolean);

      if (metadataToInsert.length > 0) {
        await supabase.from('lead_metadata').insert(metadataToInsert);
      }
    }

    // Update user plan usage
    await supabase
      .from('user_plans')
      .update({
        search_requests_used: userPlan.search_requests_used + 1,
        leads_used: userPlan.leads_used + uniqueLeads.length
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
      leadsFound: uniqueLeads.length,
      leadsRequested: leadsCount,
      cached: !!cachedResults,
      remaining: currentPlan.leads_per_month - (userPlan.leads_used + uniqueLeads.length)
    });

  } catch (error) {
    console.error('Lead generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function scrapeLeads(
  businessType: string,
  country: string,
  state: string,
  city?: string
): Promise<ScrapedLead[]> {
  const leads: ScrapedLead[] = [];
  
  try {
    // Build search query
    const location = city ? `${city}, ${state}, ${country}` : `${state}, ${country}`;
    const searchQuery = `${businessType} in ${location}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Scrape Google Maps
    const mapsUrl = `https://www.google.com/maps/search/${encodedQuery}`;
    const response = await fetch(mapsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract website URLs from Google Maps HTML
    const websiteRegex = /https?:\/\/[^\/\s"'>]+/g;
    const websites = [...new Set(html.match(websiteRegex) || [])]
      .filter(url => 
        !url.includes('google') && 
        !url.includes('gstatic') &&
        !url.includes('schema.org')
      )
      .slice(0, 50); // Limit to 50 websites

    // Scrape each website for contact info
    for (const website of websites) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        
        const siteResponse = await fetch(website, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        if (!siteResponse.ok) continue;

        const siteHtml = await siteResponse.text();
        
        // Extract emails (excluding image extensions)
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?!jpeg|jpg|png|gif|webp|svg)[a-zA-Z]{2,}/g;
        const emails = siteHtml.match(emailRegex);
        
        // Extract phone numbers
        const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
        const phones = siteHtml.match(phoneRegex);
        
        // Extract business name from title tag
        const titleMatch = siteHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
        const businessName = titleMatch ? titleMatch[1].trim() : new URL(website).hostname;

        if (emails && emails.length > 0) {
          leads.push({
            business_name: businessName,
            email: emails[0],
            phone: phones?.[0],
            website: website
          });
        }
      } catch (error) {
        console.error(`Error scraping ${website}:`, error);
        continue;
      }
    }
  } catch (error) {
    console.error('Error in scrapeLeads:', error);
  }

  return leads;
}
