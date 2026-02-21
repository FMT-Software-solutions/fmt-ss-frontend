import { useState, useEffect } from 'react';
import { useNewsletterUnsubscribe } from '@/hooks/queries/useNewsletter';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardDescription } from '@repo/ui';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const { mutate: unsubscribe, isPending } = useNewsletterUnsubscribe();

  useEffect(() => {
    if (token) {
      unsubscribe({ token }, {
        onSuccess: (data) => {
          setIsSuccess(true);
          toast.success(data.message);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    }
  }, [token, unsubscribe]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    unsubscribe({ email }, {
      onSuccess: (data) => {
        setIsSuccess(true);
        toast.success(data.message);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  if (token && isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Processing unsubscribe request...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              {isSuccess ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-destructive" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {isSuccess ? 'Unsubscribed Successfully' : 'Unsubscribe from Newsletter'}
            </CardTitle>
            <CardDescription>
              {isSuccess
                ? 'You have been removed from our mailing list. We are sorry to see you go.'
                : 'Enter your email address below to unsubscribe from our newsletter updates.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-center"
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="destructive" 
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending ? 'Processing...' : 'Unsubscribe'}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Note: This action cannot be undone. You can always subscribe again later.
                </p>
              </form>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/'}
              >
                Return to Home
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
