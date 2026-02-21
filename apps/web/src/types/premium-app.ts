export interface IDiscountCode {
    _id: string;
    code: string;
    name: string;
    description?: string;
    isActive: boolean;
    discountType: 'all_apps' | 'specific_apps' | 'minimum_total' | 'first_time' | 'bundle';
    valueType: 'percentage' | 'fixed';
    value: number;
    applicableApps?: {
        _id: string;
        title: string;
        slug: { current: string };
    }[];
    minimumAmount?: number;
    minimumAppsCount?: number;
    maxDiscount?: number;
    usageLimit?: {
        enabled: boolean;
        totalUses?: number;
        perUserLimit?: number;
    };
    validityPeriod: {
        startDate: string;
        endDate: string;
    };
    stackable: boolean;
    priority: number;
    createdAt: string;
}

export interface IDiscountValidationResult {
    isValid: boolean;
    errorMessage?: string;
    applicableItems: {
        appId: string;
        originalPrice: number;
        discountAmount: number;
        finalPrice: number;
    }[];
    totalDiscount: number;
}

export interface IDiscountApplication {
    discountCode: IDiscountCode;
    validationResult: IDiscountValidationResult;
}

export interface IPromotion {
    hasPromotion: boolean;
    discountPrice?: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
}

export interface IVideo {
    type?: 'youtube' | 'custom';
    url?: string;
}

export interface IPlatformAvailability {
    desktop?: {
        windows?: {
            available: boolean;
            downloadUrl?: string;
        };
        macos?: {
            available: boolean;
            downloadUrl?: string;
        };
        linux?: {
            available: boolean;
            downloadUrl?: string;
        };
    };
    mobile?: {
        android?: {
            available: boolean;
            playStoreUrl?: string;
            apkUrl?: string;
        };
        ios?: {
            available: boolean;
            appStoreUrl?: string;
        };
    };
    web?: {
        available: boolean;
        webAppUrl?: string;
    };
}

export interface IAppProvisioning {
    supabaseUrl: string;
    supabaseAnonKey: string;
    edgeFunctionName: string;
}

export interface IPremiumApp {
    _id: string;
    id?: string; // Used in local data
    title: string;
    slug: { type?: string; current: string };
    isPublished: boolean;
    allowMultipleOrganizationPerUser?: boolean;
    hasTrialUsage?: boolean;
    isFree?: boolean;
    mainImage: any;
    screenshots: any[];
    video?: IVideo;
    videoUrl?: string; // Deprecated - kept for backward compatibility
    description: any[]; // For rich text content from Sanity
    shortDescription: string;
    longDescription?: string; // Used in local data
    sectors: string[];
    category?: string; // Used in local data
    features: string[];
    requirements?: {
        os: string[];
        processor: string;
        memory: string;
        storage: string;
        additionalRequirements?: string[];
    };
    systemRequirements?: any; // For Sanity rich text content
    platforms: IPlatformAvailability;
    downloadUrl?: string | null; // Deprecated - kept for backward compatibility
    webAppUrl?: string | null; // Deprecated - kept for backward compatibility
    appProvisioning?: IAppProvisioning;
    tags: string[];
    price: number;
    promotion?: IPromotion;
    publishedAt?: string;
}

// Type for the premium app list view (with fewer fields)
export interface IPremiumAppListItem {
    _id: string;
    title: string;
    slug: { type?: string; current: string };
    isPublished: boolean;
    mainImage: any;
    shortDescription: string;
    sectors: string[];
    features: string[];
    platforms: IPlatformAvailability;
    tags: string[];
    price: number;
    promotion?: {
        hasPromotion: boolean;
        discountPrice?: number;
        isActive: boolean;
    };
    publishedAt?: string;
}
