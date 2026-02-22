import groq from 'groq'
import { client } from './client'
import type { IDiscountCode } from './types'

// GROQ query for fetching a discount code by code
const DISCOUNT_CODE_QUERY = groq`
  *[_type == "discountCode" && upper(code) == upper($code) && isActive == true][0] {
    _id,
    code,
    name,
    description,
    isActive,
    discountType,
    valueType,
    value,
    "applicableApps": applicableApps[]-> {
      _id,
      title,
      slug
    },
    minimumAmount,
    minimumAppsCount,
    maxDiscount,
    usageLimit,
    validityPeriod,
    stackable,
    priority,
    createdAt
  }
`;

// GROQ query for fetching all active discount codes
const ACTIVE_DISCOUNT_CODES_QUERY = groq`
  *[_type == "discountCode" && isActive == true && validityPeriod.endDate > now()] | order(priority asc) {
    _id,
    code,
    name,
    description,
    isActive,
    discountType,
    valueType,
    value,
    "applicableApps": applicableApps[]-> {
      _id,
      title,
      slug
    },
    minimumAmount,
    minimumAppsCount,
    maxDiscount,
    usageLimit,
    validityPeriod,
    stackable,
    priority,
    createdAt
  }
`;

// GROQ query for fetching discount codes applicable to specific apps
const DISCOUNT_CODES_FOR_APPS_QUERY = groq`
  *[_type == "discountCode" && isActive == true && validityPeriod.endDate > now() && 
    (discountType == "all_apps" || 
     discountType == "minimum_total" || 
     discountType == "first_time" ||
     (discountType == "specific_apps" && count(applicableApps[_ref in $appIds]) > 0) ||
     (discountType == "bundle" && (count(applicableApps) == 0 || count(applicableApps[_ref in $appIds]) > 0))
    )
  ] | order(priority asc) {
    _id,
    code,
    name,
    description,
    isActive,
    discountType,
    valueType,
    value,
    "applicableApps": applicableApps[]-> {
      _id,
      title,
      slug
    },
    minimumAmount,
    minimumAppsCount,
    maxDiscount,
    usageLimit,
    validityPeriod,
    stackable,
    priority,
    createdAt
  }
`;

/**
 * Fetches a discount code by its code string
 */
export async function getDiscountCodeByCode(code: string): Promise<IDiscountCode | null> {
  try {
    const discountCode = await client.fetch(DISCOUNT_CODE_QUERY, { code });
    return discountCode || null;
  } catch (error) {
    console.error('Error fetching discount code:', error);
    return null;
  }
}

/**
 * Fetches all active discount codes
 */
export async function getActiveDiscountCodes(): Promise<IDiscountCode[]> {
  try {
    const discountCodes = await client.fetch(ACTIVE_DISCOUNT_CODES_QUERY);
    return discountCodes || [];
  } catch (error) {
    console.error('Error fetching active discount codes:', error);
    return [];
  }
}

/**
 * Fetches discount codes that are applicable to the given app IDs
 */
export async function getDiscountCodesForApps(appIds: string[]): Promise<IDiscountCode[]> {
  try {
    const discountCodes = await client.fetch(DISCOUNT_CODES_FOR_APPS_QUERY, { appIds });
    return discountCodes || [];
  } catch (error) {
    console.error('Error fetching discount codes for apps:', error);
    return [];
  }
}

/**
 * Validates if a discount code exists and is currently valid
 */
export async function validateDiscountCodeExists(code: string): Promise<{
  exists: boolean;
  discountCode?: IDiscountCode;
  error?: string;
}> {
  try {
    const discountCode = await getDiscountCodeByCode(code);

    if (!discountCode) {
      return {
        exists: false,
        error: 'Discount code not found or inactive'
      };
    }

    // Check if the discount code is within its validity period
    const now = new Date();
    const startDate = new Date(discountCode.validityPeriod.startDate);
    const endDate = new Date(discountCode.validityPeriod.endDate);

    if (now < startDate) {
      return {
        exists: false,
        error: 'Discount code is not yet valid'
      };
    }

    if (now > endDate) {
      return {
        exists: false,
        error: 'Discount code has expired'
      };
    }

    return {
      exists: true,
      discountCode
    };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return {
      exists: false,
      error: 'Error validating discount code'
    };
  }
}

/**
 * Fetches discount codes with usage tracking (for future implementation)
 */
export async function getDiscountCodeWithUsage(code: string): Promise<{
  discountCode: IDiscountCode | null;
  currentUsage: number;
  canUse: boolean;
}> {
  try {
    const discountCode = await getDiscountCodeByCode(code);

    if (!discountCode) {
      return {
        discountCode: null,
        currentUsage: 0,
        canUse: false
      };
    }

    // TODO: Implement usage tracking with a separate collection
    // For now, assume usage is always allowed if the code exists
    const currentUsage = 0;
    const canUse = !discountCode.usageLimit?.enabled ||
      !discountCode.usageLimit.totalUses ||
      currentUsage < discountCode.usageLimit.totalUses;

    return {
      discountCode,
      currentUsage,
      canUse
    };
  } catch (error) {
    console.error('Error fetching discount code with usage:', error);
    return {
      discountCode: null,
      currentUsage: 0,
      canUse: false
    };
  }
}

/**
 * Searches discount codes by name or code (for admin purposes)
 */
export async function searchDiscountCodes(searchTerm: string): Promise<IDiscountCode[]> {
  try {
    const searchQuery = groq`
      *[_type == "discountCode" && 
        (name match $searchTerm || code match $searchTerm)
      ] | order(createdAt desc) {
        _id,
        code,
        name,
        description,
        isActive,
        discountType,
        valueType,
        value,
        "applicableApps": applicableApps[]-> {
          _id,
          title,
          slug
        },
        minimumAmount,
        minimumAppsCount,
        maxDiscount,
        usageLimit,
        validityPeriod,
        stackable,
        priority,
        createdAt
      }
    `;

    const discountCodes = await client.fetch(searchQuery, {
      searchTerm: `*${searchTerm}*`
    });
    return discountCodes || [];
  } catch (error) {
    console.error('Error searching discount codes:', error);
    return [];
  }
}
