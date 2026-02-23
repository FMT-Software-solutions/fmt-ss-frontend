export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
    base: API_BASE_URL,
    newsletter: {
        subscribe: `${API_BASE_URL}/newsletter/subscribe`,
        unsubscribe: `${API_BASE_URL}/newsletter/unsubscribe`,
        unsubscribeByEmail: `${API_BASE_URL}/newsletter/unsubscribe-by-email`,
    },
    reviews: {
        create: `${API_BASE_URL}/reviews`,
        featured: `${API_BASE_URL}/reviews/featured`,
    },
    testimonials: `${API_BASE_URL}/testimonials`,
    quotes: `${API_BASE_URL}/quotes`,
    contact: `${API_BASE_URL}/contact`,
} as const;
