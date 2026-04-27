import type { IPremiumApp, IPremiumAppListItem } from '@/types/premium-app';

export interface PriceDetails {
  originalPrice: number;
  finalPrice: number;
  isFree: boolean;
  hasActivePromotion: boolean;
  discountPercentage: number | null;
}

export function getPriceDetails(
  app: Partial<IPremiumApp> | Partial<IPremiumAppListItem>
): PriceDetails {
  const originalPrice = app.price || 0;
  
  // Note: IPremiumAppListItem might not have isFree, so we also check if originalPrice is 0
  const isFree = 'isFree' in app ? !!app.isFree : originalPrice === 0;

  const promotion = app.promotion;
  const hasActivePromotion = !!(
    promotion?.hasPromotion &&
    promotion?.isActive &&
    promotion?.discountPrice &&
    promotion.discountPrice < originalPrice
  );

  const finalPrice = hasActivePromotion && promotion?.discountPrice
    ? promotion.discountPrice
    : isFree
      ? 0
      : originalPrice;

  let discountPercentage = null;
  if (hasActivePromotion && originalPrice > 0) {
    const discountAmount = originalPrice - finalPrice;
    discountPercentage = Math.round((discountAmount / originalPrice) * 100);
  }

  return {
    originalPrice,
    finalPrice,
    isFree,
    hasActivePromotion,
    discountPercentage,
  };
}
