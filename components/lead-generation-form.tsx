'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';

interface LeadGenerationFormProps {
  onSuccess?: (data: any) => void;
}

export function LeadGenerationForm({ onSuccess }: LeadGenerationFormProps) {
  const [businessType, setBusinessType] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [leadsCount, setLeadsCount] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    // Fetch remaining leads
    fetchRemainingLeads();
  }, []);

  const fetchRemainingLeads = async () => {
    try {
      const response = await fetch('/api/leads/remaining');
      if (response.ok) {
        const data = await response.json();
        setRemaining(data.remaining);
      }
    } catch (error) {
      console.error('Error fetching remaining leads:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!businessType || !country || !state || !leadsCount) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        businessType,
        country,
        state,
        city: city || undefined,
        leadsCount: leadsCount, // Make sure this matches the API expectation
      };
      
      console.log('Sending lead generation request:', payload);

      const response = await fetch('/api/leads/generate-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Lead generation response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate leads');
      }

      setRemaining(data.remaining);
      
      console.log('Leads received:', data.leads);
      console.log('Leads count:', data.leadsFound);
      
      // Store leads in sessionStorage
      if (data.leads && data.leads.length > 0) {
        sessionStorage.setItem('generated_leads', JSON.stringify(data.leads));
        console.log('Stored in sessionStorage:', data.leads.length, 'leads');
        // Redirect to success page
        window.location.href = '/dashboard/generate/success';
      } else {
        alert(`No leads found. Try different search criteria or wait a moment and try again.`);
      }
      
      if (onSuccess) {
        onSuccess(data);
      }
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Find Businesses in Your Target Market
        </h2>
        <p className="text-gray-600">
          Fill in the details below to discover quality leads
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Type */}
        <div className="space-y-2">
          <Label htmlFor="businessType">
            Business Type <span className="text-red-500">*</span>
          </Label>
          <input
            id="businessType"
            type="text"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder="e.g., Dentists, Restaurants, Real Estate Agents"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">
            Country <span className="text-red-500">*</span>
          </Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger id="country">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="UK">United Kingdom</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Pakistan">Pakistan</SelectItem>
              <SelectItem value="India">India</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* State/Province */}
        <div className="space-y-2">
          <Label htmlFor="state">
            State/Province <span className="text-red-500">*</span>
          </Label>
          <input
            id="state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g., California, Ontario, Punjab"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* City (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="city">City (Optional)</Label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Los Angeles, Toronto, Lahore"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Number of Leads */}
        <div className="space-y-2">
          <Label htmlFor="leadsCount">
            Number of Leads <span className="text-red-500">*</span>
          </Label>
          <Select
            value={leadsCount.toString()}
            onValueChange={(value) => setLeadsCount(parseInt(value))}
          >
            <SelectTrigger id="leadsCount">
              <SelectValue placeholder="Select number of leads" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 leads</SelectItem>
              <SelectItem value="20">20 leads</SelectItem>
              <SelectItem value="50">50 leads</SelectItem>
              <SelectItem value="100">100 leads</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Remaining Leads Display */}
        {remaining !== null && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              You have <span className="font-bold">{remaining} leads</span> remaining this month
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Leads...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Generate Leads
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
