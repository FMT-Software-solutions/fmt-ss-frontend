import { useMutation, useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../../lib/endpoints';

export interface CreateReviewDto {
  type: 'general' | 'app-specific';
  app_id?: string;
  rating: number;
  content: string;
  name: string;
  email: string;
  company?: string;
  position?: string;
}

export function useCreateReview() {
  return useMutation({
    mutationFn: async (data: CreateReviewDto) => {
      const response = await fetch(API_ENDPOINTS.reviews.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }

      return response.json();
    },
  });
}

export function useFeaturedReviews() {
  return useQuery({
    queryKey: ['reviews', 'featured'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.reviews.featured);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
  });
}

export function useAppReviews(appId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', 'app', appId],
    queryFn: async () => {
      if (!appId) return [];
      const response = await fetch(`${API_ENDPOINTS.reviews.create}/app/${appId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
    enabled: !!appId,
  });
}
