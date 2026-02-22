import { useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/endpoints';

export interface CreateQuoteDto {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber1: string;
  contactNumber2?: string;
  company?: string;
  serviceType: string;
  budget: string;
  description: string;
}

export function useCreateQuote() {
  return useMutation({
    mutationFn: async (data: CreateQuoteDto) => {
      const response = await fetch(API_ENDPOINTS.quotes, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit quote request');
      }

      return response.json();
    },
  });
}
