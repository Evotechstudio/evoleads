export interface SearchFormData {
  businessType: string
  country: string
  state: string
  city: string
  leadsRequested: number
}

export interface FormErrors {
  businessType?: string
  country?: string
  state?: string
  city?: string
  leadsRequested?: string
  usage?: string
}

export interface Lead {
  id: string
  businessName: string
  email: string
  phone: string
  website: string
  confidenceScore: number
  searchId: string
  createdAt: string
}

export interface SearchResult {
  id: string
  searchParams: SearchFormData
  leads: Lead[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
}

export interface LocationOption {
  value: string
  label: string
  disabled?: boolean
}