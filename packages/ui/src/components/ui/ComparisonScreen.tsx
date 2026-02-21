'use client';
import {
  Comparison,
  ComparisonHandle,
  ComparisonItem,
} from '@/components/ui/kibo-ui/comparison';
import Image from 'next/image';

export const ComparisonScreen = () => (
  <Comparison className="aspect-video">
    <ComparisonItem position="left">
      <Image
        alt="Placeholder 1"
        className="opacity-90"
        height={1080}
        src="https://res.cloudinary.com/mister-shadrack/image/upload/v1747082247/mr-shadrack/ysarqlyjok8zumliifay.jpg"
        unoptimized
        width={1920}
      />
    </ComparisonItem>
    <ComparisonItem position="right">
      <Image
        alt="Placeholder 2"
        className="opacity-90"
        height={1440}
        src="https://res.cloudinary.com/mister-shadrack/image/upload/v1738673722/x4tvgvoin2dnfmhvydq1.png"
        unoptimized
        width={2560}
      />
    </ComparisonItem>
    <ComparisonHandle />
  </Comparison>
);
