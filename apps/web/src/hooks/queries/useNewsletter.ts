import { useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../../lib/endpoints';

interface SubscribePayload {
  email: string;
}

interface SubscribeResponse {
  message: string;
  unsubscribeUrl?: string;
  error?: string;
}

export function useNewsletterSubscription() {
  return useMutation({
    mutationFn: async (payload: SubscribePayload) => {
      const response = await fetch(API_ENDPOINTS.newsletter.subscribe, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to subscribe');
      }

      return data as SubscribeResponse;
    },
  });
}

export function useNewsletterUnsubscribe() {
  return useMutation({
    mutationFn: async (payload: { email?: string; token?: string }) => {
      let url: string = API_ENDPOINTS.newsletter.unsubscribe;
      let body: any = {};

      if (payload.token) {
        body = { token: payload.token };
      } else if (payload.email) {
        url = API_ENDPOINTS.newsletter.unsubscribeByEmail;
        body = { email: payload.email };
      } else {
        throw new Error('Either email or token must be provided');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to unsubscribe');
      }

      return data as { message: string };
    },
  });
}
