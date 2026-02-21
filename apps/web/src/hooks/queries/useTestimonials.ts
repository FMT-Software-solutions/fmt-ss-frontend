import { API_ENDPOINTS } from '@/lib/endpoints';
import { useQuery } from '@tanstack/react-query';

export interface Testimonial {
  text: string;
  imageSrc?: string;
  name: string;
  username?: string;
  role?: string;
  rating?: number;
}

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.testimonials);
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }
      return response.json() as Promise<Testimonial[]>;
    },
  });
}
