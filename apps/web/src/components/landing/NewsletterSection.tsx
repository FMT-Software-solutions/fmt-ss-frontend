import { Button, Input } from '@repo/ui';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useNewsletterSubscription } from '@/hooks/queries/useNewsletter';

// Email validation schema
const emailSchema = z.email('Please enter a valid email address');

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { mutate, isPending, error: apiError } = useNewsletterSubscription();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate email
    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationError(err.issues[0].message);
        return;
      }
      setValidationError('Please enter a valid email address');
      return;
    }

    mutate(
      { email },
      {
        onSuccess: (data) => {
          toast.success(data.message || 'Successfully subscribed to the newsletter!');
          setEmail('');
        },
        onError: (err) => {
          console.error('Newsletter subscription error:', err);
        },
      }
    );
  };

  return (
    <section className="relative py-24 overflow-hidden bg-primary text-primary-foreground">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 w-full h-full">
        {/* Dot Pattern */}
        <div className="absolute h-full w-full bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-size-[20px_20px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Subtle Gradient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-primary-foreground/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Stay Updated</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Subscribe to our newsletter for updates on our software solutions and more.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto relative">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/30 focus-visible:border-primary-foreground/50"
              required
              disabled={isPending}
            />
            <Button
              type="submit"
              variant="secondary"
              disabled={isPending}
              className="font-semibold"
            >
              {isPending ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>

          {validationError && (
            <p className="text-red-300 mt-2 text-sm font-medium">{validationError}</p>
          )}

          {apiError && (
            <p className="text-red-300 mt-2 text-sm font-medium">{apiError.message}</p>
          )}

          <p className="text-xs text-primary-foreground/60 mt-6 max-w-sm text-center mx-auto">
            By subscribing, you agree to our privacy policy. We respect your
            privacy and will never share your information.
          </p>
        </div>
      </div>
    </section>
  );
}
