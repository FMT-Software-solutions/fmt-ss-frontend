import { cn } from '@repo/ui';

interface LogoProps {
  className?: string;
}

/**
 * The wordmark's swoosh is black in the standard asset and white in the
 * -white variant, so both are rendered and swapped by theme in CSS. Doing it
 * this way avoids the wrong logo flashing before the theme resolves.
 */
export function Logo({ className }: LogoProps) {
  return (
    <>
      <img
        src="/fmt-logo_.png"
        alt="FMT Software"
        className={cn('w-auto dark:hidden', className)}
      />
      <img
        src="/fmt-logo-white.png"
        alt="FMT Software"
        className={cn('hidden w-auto dark:block', className)}
      />
    </>
  );
}
