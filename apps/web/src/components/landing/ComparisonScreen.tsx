import {
  Comparison,
  ComparisonHandle,
  ComparisonItem,
} from '@repo/ui';

export const ComparisonScreen = () => (
  <Comparison className="aspect-video">
    <ComparisonItem position="left">
      <img
        alt="Placeholder 1"
        className="opacity-90 w-full h-full object-cover"
        src="https://res.cloudinary.com/mister-shadrack/image/upload/v1747082247/mr-shadrack/ysarqlyjok8zumliifay.jpg"
      />
    </ComparisonItem>
    <ComparisonItem position="right">
      <img
        alt="Placeholder 2"
        className="opacity-90 w-full h-full object-cover"
        src="https://res.cloudinary.com/mister-shadrack/image/upload/v1738673722/x4tvgvoin2dnfmhvydq1.png"
      />
    </ComparisonItem>
    <ComparisonHandle />
  </Comparison>
);
