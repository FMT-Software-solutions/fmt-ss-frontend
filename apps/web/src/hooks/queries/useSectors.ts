import { useQuery } from '@tanstack/react-query';
import { client, groq } from '@/lib/sanity';

export interface Sector {
    _id: string;
    name: string;
    slug: {
        current: string;
    };
    icon?: string;
}

const sectorsQuery = groq`
  *[_type == "sector"] | order(name asc) {
    _id,
    name,
    slug,
    icon
  }
`;

export function useSectors() {
    return useQuery({
        queryKey: ['sectors'],
        queryFn: async () => {
            const data = await client.fetch<Sector[]>(sectorsQuery);
            return data || [];
        },
    });
}
