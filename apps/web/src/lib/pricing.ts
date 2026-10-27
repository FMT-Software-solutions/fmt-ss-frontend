import type { IPremiumApp, IPremiumAppListItem } from '@/types/premium-app';

export interface PriceDetails {
  originalPrice: number;
  finalPrice: number;
  isFree: boolean;
  hasActivePromotion: boolean;
  discountPercentage: number | null;
}

export function getPriceDetails(
  app: Partial<Pick<IPremiumApp, 'price' | 'isFree' | 'promotion'>> | Partial<IPremiumAppListItem>
): PriceDetails {
  const originalPrice = app.price || 0;
  
  // Note: IPremiumAppListItem might not have isFree, so we also check if originalPrice is 0
  const isFree = 'isFree' in app ? !!app.isFree : originalPrice === 0;

  const promotion = app.promotion;
  // Same rule as the server: a promotion only counts inside its dates.
  const now = new Date();
  const inWindow =
    (!promotion?.startDate || now >= new Date(promotion.startDate)) &&
    (!promotion?.endDate || now <= new Date(promotion.endDate));
  const hasActivePromotion = !!(
    promotion?.hasPromotion &&
    promotion?.isActive !== false &&
    inWindow &&
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
