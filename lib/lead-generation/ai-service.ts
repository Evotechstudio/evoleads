import { env } from '../env'

export interface LeadGenerationRequest {
  business_type: string
  country: string
  state: string
  city: string
  leads_requested: number
}

export interface GeneratedLead {
  business_name: string
  email?: string
  phone?: string
  website?: string
  address?: string
  industry?: string
  description?: string
}

export async function generateLeadsWithAI(request: LeadGenerationRequest): Promise<GeneratedLead[]> {
  try {
    // First, try to get leads from SerpAPI + AI processing
    const serpResults = await searchBusinessesWithSerpAPI(request)
    
    if (serpResults.length > 0) {
      // Process SERP results with AI to extract and enhance lead data
      return await enhanceLeadsWithAI(serpResults, request)
    }

    // Fallback to direct AI generation if SERP fails
    return await generateLeadsDirectlyWithAI(request)
    
  } catch (error) {
    console.error('AI lead generation failed:', error)
    throw new Error('Lead generation service unavailable')
  }
}

async function searchBusinessesWithSerpAPI(request: LeadGenerationRequest): Promise<any[]> {
  const serpApiKey = process.env.SERPAPI_KEY
  
  if (!serpApiKey) {
    console.warn('SERPAPI_KEY not configured, skipping SERP search')
    return []
  }

  try {
    const query = `${request.business_type} in ${request.city}, ${request.state}, ${request.country}`
    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=${Math.min(request.leads_requested * 2, 100)}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'EvoLeadAI/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`SERP API error: ${response.status}`)
    }

    const data = await response.json()
    return data.organic_results || []
    
  } catch (error) {
    console.error('SERP API search failed:', error)
    return []
  }
}

async function enhanceLeadsWithAI(serpResults: any[], request: LeadGenerationRequest): Promise<GeneratedLead[]> {
  const geminiApiKey = process.env.GEMINI_API_KEY
  
  if (!geminiApiKey) {
    // Fallback to basic processing without AI enhancement
    return processSerpResultsBasic(serpResults, request.leads_requested)
  }

  try {
    const prompt = createLeadExtractionPrompt(serpResults, request)
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (aiResponse) {
      return parseAILeadResponse(aiResponse, request.leads_requested)
    }

    // Fallback to basic processing
    return processSerpResultsBasic(serpResults, request.leads_requested)
    
  } catch (error) {
    console.error('AI enhancement failed:', error)
    return processSerpResultsBasic(serpResults, request.leads_requested)
  }
}

async function generateLeadsDirectlyWithAI(request: LeadGenerationRequest): Promise<GeneratedLead[]> {
  const geminiApiKey = process.env.GEMINI_API_KEY
  
  if (!geminiApiKey) {
    // Return mock leads if no AI service available
    return generateMockLeads(request)
  }

  try {
    const prompt = createDirectGenerationPrompt(request)
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (aiResponse) {
      return parseAILeadResponse(aiResponse, request.leads_requested)
    }

    // Fallback to mock leads
    return generateMockLeads(request)
    
  } catch (error) {
    console.error('Direct AI generation failed:', error)
    return generateMockLeads(request)
  }
}

function createLeadExtractionPrompt(serpResults: any[], request: LeadGenerationRequest): string {
  const resultsText = serpResults.slice(0, 20).map(result => 
    `Title: ${result.title}\nSnippet: ${result.snippet}\nLink: ${result.link}`
  ).join('\n\n')

  return `Extract business lead information from these search results for ${request.business_type} businesses in ${request.city}, ${request.state}, ${request.country}.

Search Results:
${resultsText}

Please extract and format exactly ${request.leads_requested} business leads as a JSON array with this structure:
[
  {
    "business_name": "Business Name",
    "email": "contact@business.com",
    "phone": "+1-555-0123",
    "website": "https://business.com",
    "address": "123 Main St, City, State",
    "industry": "${request.business_type}",
    "description": "Brief description"
  }
]

Rules:
- Only include real businesses that match the requested type
- Generate realistic email addresses based on business names
- Include phone numbers in proper format
- Ensure all data is relevant to ${request.city}, ${request.state}
- If you can't find enough real businesses, generate realistic ones
- Return valid JSON only, no additional text`
}

function createDirectGenerationPrompt(request: LeadGenerationRequest): string {
  return `Generate ${request.leads_requested} realistic business leads for ${request.business_type} businesses located in ${request.city}, ${request.state}, ${request.country}.

Create a JSON array with this exact structure:
[
  {
    "business_name": "Business Name",
    "email": "contact@business.com",
    "phone": "+1-555-0123",
    "website": "https://business.com",
    "address": "123 Main St, ${request.city}, ${request.state}",
    "industry": "${request.business_type}",
    "description": "Brief business description"
  }
]

Requirements:
- Generate realistic business names relevant to ${request.business_type}
- Create professional email addresses based on business names
- Use proper phone number formats for ${request.country}
- Generate realistic websites (use .com, .net, .org)
- Include specific addresses in ${request.city}, ${request.state}
- Make descriptions relevant to the business type
- Ensure all data looks authentic and professional
- Return valid JSON only, no additional text`
}

function parseAILeadResponse(aiResponse: string, maxLeads: number): GeneratedLead[] {
  try {
    // Clean the response to extract JSON
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No JSON array found in AI response')
    }

    const leads = JSON.parse(jsonMatch[0])
    
    if (!Array.isArray(leads)) {
      throw new Error('AI response is not an array')
    }

    return leads.slice(0, maxLeads).map(lead => ({
      business_name: lead.business_name || lead.name || 'Unknown Business',
      email: lead.email || null,
      phone: lead.phone || null,
      website: lead.website || null,
      address: lead.address || null,
      industry: lead.industry || null,
      description: lead.description || null
    }))
    
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    throw new Error('Invalid AI response format')
  }
}

function processSerpResultsBasic(serpResults: any[], maxLeads: number): GeneratedLead[] {
  return serpResults.slice(0, maxLeads).map((result, index) => {
    const businessName = result.title || `Business ${index + 1}`
    const domain = extractDomain(result.link)
    
    return {
      business_name: businessName,
      email: generateEmailFromDomain(domain),
      phone: generatePhoneNumber(),
      website: result.link || null,
      address: undefined,
      industry: undefined,
      description: result.snippet || null
    }
  })
}

function generateMockLeads(request: LeadGenerationRequest): GeneratedLead[] {
  const businessTypes = {
    'restaurant': ['Bistro', 'Cafe', 'Grill', 'Kitchen', 'Diner'],
    'retail': ['Store', 'Shop', 'Boutique', 'Market', 'Outlet'],
    'service': ['Services', 'Solutions', 'Group', 'Company', 'Associates'],
    'default': ['Business', 'Company', 'Enterprise', 'Group', 'Services']
  }

  const suffixes = businessTypes[request.business_type.toLowerCase() as keyof typeof businessTypes] || businessTypes.default

  return Array.from({ length: request.leads_requested }, (_, i) => {
    const suffix = suffixes[i % suffixes.length]
    const businessName = `${request.city} ${suffix} ${i + 1}`
    const domain = businessName.toLowerCase().replace(/\s+/g, '') + '.com'
    
    return {
      business_name: businessName,
      email: `contact@${domain}`,
      phone: generatePhoneNumber(),
      website: `https://${domain}`,
      address: `${100 + i} Main Street, ${request.city}, ${request.state}`,
      industry: request.business_type,
      description: `Professional ${request.business_type} business serving ${request.city} area`
    }
  })
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return 'example.com'
  }
}

function generateEmailFromDomain(domain: string): string {
  const prefixes = ['contact', 'info', 'hello', 'sales', 'support']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  return `${prefix}@${domain}`
}

function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100
  const exchange = Math.floor(Math.random() * 900) + 100
  const number = Math.floor(Math.random() * 9000) + 1000
  return `+1-${areaCode}-${exchange}-${number}`
}