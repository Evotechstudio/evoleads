import { NextRequest, NextResponse } from 'next/server';
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
}

// Simple in-memory storage for demo (replace with database in production)
const userUsage = new Map<string, { searches: number; leads: number; resetDate: Date }>();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: any = await request.json();
    console.log('API received body:', body);
    
    // Support both leadsCount and leadsRequested
    const leadsCount = body.leadsCount || body.leadsRequested;
    const { businessType, country, state, city } = body;

    // Validate input
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

    // Get or initialize user usage
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    let usage = userUsage.get(userId);
    if (!usage || usage.resetDate < now) {
      usage = { searches: 0, leads: 0, resetDate };
      userUsage.set(userId, usage);
    }

    // Check limits (Free plan: 2 searches, 20 leads)
    const SEARCH_LIMIT = 2;
    const LEAD_LIMIT = 20;

    if (usage.searches >= SEARCH_LIMIT) {
      return NextResponse.json(
        { error: 'Monthly search limit exceeded', remaining: 0 },
        { status: 403 }
      );
    }

    if (usage.leads + leadsCount > LEAD_LIMIT) {
      return NextResponse.json(
        { 
          error: 'Monthly lead limit exceeded', 
          remaining: LEAD_LIMIT - usage.leads 
        },
        { status: 403 }
      );
    }

    // Scrape leads
    const leads = await scrapeLeads(businessType, country, state, city, leadsCount);

    // Update usage
    usage.searches += 1;
    usage.leads += leads.length;
    userUsage.set(userId, usage);

    console.log(`Generated ${leads.length} leads for user ${userId}`);

    // Try to save to database (optional - won't fail if DB not set up)
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Create search record
      const { data: searchRecord } = await supabase
        .from('user_searches')
        .insert({
          user_id: userId,
          business_type: businessType,
          country,
          state,
          city: city || '',
          leads_requested: leadsCount,
          status: 'completed'
        })
        .select()
        .single();

      if (searchRecord) {
        // Save leads to database
        const leadsToInsert = leads.map(lead => ({
          search_id: searchRecord.id,
          business_name: lead.business_name,
          email: lead.email,
          phone: lead.phone,
          website: lead.website,
          confidence_score: lead.email ? 0.9 : 0.5
        }));

        await supabase.from('leads').insert(leadsToInsert);
        console.log(`Saved ${leads.length} leads to database`);
      }
    } catch (dbError) {
      console.log('Database save skipped (optional):', dbError);
    }

    return NextResponse.json({
      success: true,
      leadsFound: leads.length,
      leadsRequested: leadsCount,
      leads: leads,
      remaining: LEAD_LIMIT - usage.leads,
      searchesRemaining: SEARCH_LIMIT - usage.searches
    });

  } catch (error) {
    console.error('Lead generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    );
  }
}

async function scrapeLeads(
  businessType: string,
  country: string,
  state: string,
  city?: string,
  maxLeads: number = 10
): Promise<ScrapedLead[]> {
  const leads: ScrapedLead[] = [];
  
  try {
    // Build search query
    const location = city ? `${city}, ${state}, ${country}` : `${state}, ${country}`;
    const searchQuery = `${businessType} in ${location}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    console.log(`Scraping: ${searchQuery}`);
    
    // Scrape Google Maps
    const mapsUrl = `https://www.google.com/maps/search/${encodedQuery}`;
    const response = await fetch(mapsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return leads;
    }

    const html = await response.text();
    
    // Extract website URLs
    const websiteRegex = /https?:\/\/[^\/\s"'>]+/g;
    const websites = [...new Set(html.match(websiteRegex) || [])]
      .filter(url => 
        !url.includes('google') && 
        !url.includes('gstatic') &&
        !url.includes('schema.org') &&
        !url.includes('youtube') &&
        !url.includes('facebook') &&
        !url.includes('instagram')
      )
      .slice(0, Math.min(maxLeads * 5, 50)); // Get more websites to increase chances

    console.log(`Found ${websites.length} websites to scrape`);

    // Scrape each website for contact info
    for (const website of websites) {
      if (leads.length >= maxLeads) break;
      
      try {
        await new Promise(resolve => setTimeout(resolve, 300)); // Faster rate limiting
        
        // Try main page first
        let siteHtml = '';
        try {
          const siteResponse = await fetch(website, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            signal: AbortSignal.timeout(5000)
          });

          if (siteResponse.ok) {
            siteHtml = await siteResponse.text();
          }
        } catch (error) {
          console.log(`Skipping ${website}: ${error}`);
          continue;
        }

        // Also try contact page
        const contactUrls = [
          `${website}/contact`,
          `${website}/contact-us`,
          `${website}/about`,
          `${website}/about-us`
        ];

        for (const contactUrl of contactUrls) {
          if (leads.length >= maxLeads) break;
          
          try {
            const contactResponse = await fetch(contactUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              },
              signal: AbortSignal.timeout(3000)
            });

            if (contactResponse.ok) {
              const contactHtml = await contactResponse.text();
              siteHtml += ' ' + contactHtml; // Combine with main page
              break; // Found contact page, no need to try others
            }
          } catch (error) {
            // Contact page not found, continue
          }
        }

        if (!siteHtml) continue;
        
        // Extract emails with better regex
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?!jpeg|jpg|png|gif|webp|svg|css|js)[a-zA-Z]{2,}/gi;
        const emails = [...new Set(siteHtml.match(emailRegex) || [])]
          .filter(email => 
            !email.includes('example.com') &&
            !email.includes('test.com') &&
            !email.includes('placeholder') &&
            !email.includes('wixpress') &&
            !email.includes('sentry')
          );
        
        // Extract phone numbers (Pakistan format too)
        const phoneRegex = /(\+92|0)?[-.\s]?\d{3}[-.\s]?\d{7}|(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
        const phones = siteHtml.match(phoneRegex);
        
        // Extract business name
        const titleMatch = siteHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
        let businessName = titleMatch?.[1]?.trim() || new URL(website).hostname;
        
        // Clean up business name
        businessName = businessName
          .replace(/\s*[-|–]\s*.*/g, '') // Remove everything after dash or pipe
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 100); // Limit length

        // Add lead if we found email OR phone
        if ((emails && emails.length > 0) || (phones && phones.length > 0)) {
          leads.push({
            business_name: businessName || 'Unknown Business',
            email: emails?.[0],
            phone: phones?.[0],
            website: website
          });
          console.log(`✓ Found lead: ${businessName} (${emails?.[0] || phones?.[0]})`);
        }
      } catch (error) {
        console.error(`Error scraping ${website}:`, error);
        continue;
      }
    }
  } catch (error) {
    console.error('Error in scrapeLeads:', error);
  }

  console.log(`Total leads found: ${leads.length}`);
  
  // If no leads found, generate demo leads for testing
  if (leads.length === 0) {
    console.log('No leads found from scraping, generating demo leads...');
    const demoLeads: ScrapedLead[] = [
      {
        business_name: `${businessType} - Demo Lead 1`,
        email: 'contact@example-business1.com',
        phone: '+92 300 1234567',
        website: 'https://example-business1.com'
      },
      {
        business_name: `${businessType} - Demo Lead 2`,
        email: 'info@example-business2.com',
        phone: '+92 321 7654321',
        website: 'https://example-business2.com'
      },
      {
        business_name: `${businessType} - Demo Lead 3`,
        email: 'hello@example-business3.com',
        phone: '+92 333 9876543',
        website: 'https://example-business3.com'
      }
    ];
    
    return demoLeads.slice(0, maxLeads);
  }
  
  return leads;
}
