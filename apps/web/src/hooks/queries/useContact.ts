import { useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/endpoints';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export function useContact() {
  return useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await fetch(API_ENDPOINTS.contact, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }

      return response.json();
    },
  });
}
