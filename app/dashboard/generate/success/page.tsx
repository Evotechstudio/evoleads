'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Mail, Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Lead {
  business_name: string;
  email?: string;
  phone?: string;
  website?: string;
  category?: string;
  rating?: number;
  review_count?: number;
  address?: string;
  city?: string;
  state?: string;
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get leads from sessionStorage (set by the form)
    const storedLeads = sessionStorage.getItem('generated_leads');
    if (storedLeads) {
      setLeads(JSON.parse(storedLeads));
      sessionStorage.removeItem('generated_leads'); // Clear after reading
    }
    setLoading(false);
  }, []);

  const downloadCSV = () => {
    const headers = ['Business Name', 'Category', 'Rating', 'Reviews', 'Address', 'Email', 'Phone', 'Website'];
    const rows = leads.map(lead => [
      lead.business_name,
      lead.category || '',
      lead.rating || '',
      lead.review_count || '',
      lead.address || '',
      lead.email || '',
      lead.phone || '',
      lead.website || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
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

  if (leads.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">No Leads Found</h1>
          <p className="text-muted-foreground mb-6">
            No leads were generated. Please try again with different search criteria.
          </p>
          <Link href="/dashboard/generate">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Generated Leads
          </h1>
          <p className="text-muted-foreground mt-2">
            Found {leads.length} leads
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={downloadCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
          <Link href="/dashboard/generate">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              New Search
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Business Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
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
              {leads.map((lead, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-foreground">
                      {lead.business_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.category ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {lead.category}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.rating ? (
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-foreground">
                          {lead.rating} ⭐
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

      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-md">
        <h3 className="text-sm font-medium text-foreground mb-2">
          💡 Next Steps
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Download the CSV file to import into your CRM</li>
          <li>• Click on emails to start composing messages</li>
          <li>• Visit websites to learn more about each business</li>
          <li>• Run another search to find more leads</li>
        </ul>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
