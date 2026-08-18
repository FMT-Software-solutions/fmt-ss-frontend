export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
    base: API_BASE_URL,
    adminAuth: {
        forgotPassword: `${API_BASE_URL}/admin-auth/forgot-password`,
    },
    admin: {
        site: {
            stats: `${API_BASE_URL}/admin/site/stats`,
            messages: `${API_BASE_URL}/admin/site/messages`,
            quotes: `${API_BASE_URL}/admin/site/quotes`,
            purchases: `${API_BASE_URL}/admin/site/purchases`,
            reviews: `${API_BASE_URL}/admin/site/reviews`,
            newsletter: `${API_BASE_URL}/admin/site/newsletter`,
            trainingRegistrations: `${API_BASE_URL}/admin/site/training-registrations`,
            issues: `${API_BASE_URL}/admin/site/issues`,
        },
        apps: {
            registry: `${API_BASE_URL}/admin/apps/registry`,
            summary: `${API_BASE_URL}/admin/apps/summary`,
            organizations: (appId: string) => `${API_BASE_URL}/admin/apps/${appId}/organizations`,
            organization: (appId: string, orgId: string) =>
                `${API_BASE_URL}/admin/apps/${appId}/organizations/${orgId}`,
            organizationUsers: (appId: string, orgId: string) =>
                `${API_BASE_URL}/admin/apps/${appId}/organizations/${orgId}/users`,
            organizationRoles: (appId: string, orgId: string) =>
                `${API_BASE_URL}/admin/apps/${appId}/organizations/${orgId}/roles`,
            smsCredits: (appId: string, orgId: string) =>
                `${API_BASE_URL}/admin/apps/${appId}/organizations/${orgId}/sms-credits`,
            member: (appId: string, orgId: string, membershipId: string) =>
                `${API_BASE_URL}/admin/apps/${appId}/organizations/${orgId}/users/${membershipId}`,
        },
        audit: `${API_BASE_URL}/admin/audit`,
        provisioning: {
            apps: `${API_BASE_URL}/admin/provisioning/apps`,
            history: `${API_BASE_URL}/admin/provisioning/history`,
            preflight: `${API_BASE_URL}/admin/provisioning/preflight`,
            purchase: `${API_BASE_URL}/admin/provisioning/purchase`,
            run: `${API_BASE_URL}/admin/provisioning/run`,
            confirmationEmail: `${API_BASE_URL}/admin/provisioning/confirmation-email`,
        },
        organizations: `${API_BASE_URL}/admin/organizations`,
        manualPurchases: {
            apps: `${API_BASE_URL}/admin/manual-purchases/apps`,
            create: `${API_BASE_URL}/admin/manual-purchases/create`,
            provision: `${API_BASE_URL}/admin/manual-purchases/provision`,
            email: `${API_BASE_URL}/admin/manual-purchases/email`,
        },
    },
} as const;

/** Appends defined query params to a base URL. */
export function withQuery(url: string, params: object): string {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            search.set(key, String(value));
        }
    });
    const query = search.toString();
    return query ? `${url}?${query}` : url;
}
