'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Mail, Phone, Globe, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Lead {
  id: string;
  business_name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  rating?: number;
  review_count?: number;
  google_maps_url?: string;
  confidence_score?: number;
}

interface SearchInfo {
  business_type: string;
  country: string;
  state: string;
  city: string;
  leads_requested: number;
  status: string;
  created_at: string;
}

export default function SearchLeadsPage() {
  const params = useParams();
  const router = useRouter();
  const searchId = params.searchId as string;
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, [searchId]);

  const fetchLeads = async () => {
    try {
      const response = await fetch(`/api/leads/by-search/${searchId}`);
      const data = await response.json();
      
      console.log('API Response:', response.status, data);
      
      if (response.ok) {
        setLeads(data.leads || []);
        setSearchInfo(data.search);
      } else {
        console.error('Failed to fetch leads:', data.error);
        alert(`Error: ${data.error || 'Failed to fetch leads'}`);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      alert('Error loading leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const headers = ['Business Name', 'Email', 'Phone', 'Website', 'Address', 'Rating', 'Reviews'];
    const rows = leads.map(lead => [
      lead.business_name,
      lead.email || '',
      lead.phone || '',
      lead.website || '',
      lead.address || '',
      lead.rating || '',
      lead.review_count || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${searchInfo?.business_type}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/dashboard/leads">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search History
          </Button>
        </Link>

        {searchInfo && (
          <div className="bg-card rounded-lg shadow p-4 md:p-6 mb-6 border border-border">
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              {searchInfo.business_type}
            </h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
              <span className="flex items-center">
                <MapPin className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                <span className="truncate">{searchInfo.city}, {searchInfo.state}, {searchInfo.country}</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Requested: {searchInfo.leads_requested}</span>
              <span className="hidden sm:inline">•</span>
              <span>Found: {leads.length}</span>
              <span className="hidden sm:inline">•</span>
              <span className="capitalize">{searchInfo.status}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">
            {leads.length} Leads Found
          </h2>
          <Button onClick={downloadCSV} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-card rounded-lg shadow overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Business Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Website
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-foreground">
                      {lead.business_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.rating ? (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium text-foreground">
                          {lead.rating}
                        </span>
                        {lead.review_count && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({lead.review_count})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {lead.address ? (
                      <div className="text-sm text-foreground max-w-xs truncate" title={lead.address}>
                        {lead.address}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.email ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-sm text-primary hover:underline flex items-center"
                      >
                        <Mail className="mr-1 h-3 w-3" />
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-sm text-primary hover:underline flex items-center"
                      >
                        <Phone className="mr-1 h-3 w-3" />
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center"
                      >
                        <Globe className="mr-1 h-3 w-3" />
                        Visit
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-card rounded-lg shadow border border-border p-4 space-y-3">
            {/* Business Name */}
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground text-base">{lead.business_name}</h3>
            </div>

            {/* Rating */}
            {lead.rating && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-foreground">{lead.rating}</span>
                {lead.review_count && (
                  <span className="text-xs text-muted-foreground">({lead.review_count} reviews)</span>
                )}
              </div>
            )}

            {/* Address */}
            {lead.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{lead.address}</span>
              </div>
            )}

            {/* Contact Info */}
            <div className="space-y-2 pt-2 border-t border-border">
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{lead.email}</span>
                </a>
              )}
              
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  <span>{lead.phone}</span>
                </a>
              )}
              
              {lead.website && (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  <span className="truncate">Visit Website</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
