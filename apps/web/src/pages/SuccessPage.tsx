import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  const reference = searchParams.get('reference');
  const type = searchParams.get('type') || 'payment'; // payment, trial

  useEffect(() => {
    if (!reference && type === 'payment') {
      // If no reference for payment, maybe redirect? 
      // But for now let's just show the page.
    }
  }, [reference, type]);

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.1}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md text-center border-green-200 shadow-lg">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              {type === 'trial' ? 'Trial Request Successful!' : 'Payment Successful!'}
            </CardTitle>
            <CardDescription>
              {type === 'trial'
                ? 'Your trial access has been provisioned.'
                : 'Thank you for your purchase.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {type === 'trial'
                ? 'You should receive an email with your login details shortly.'
                : 'We have received your payment and your account is being set up. Check your email for further instructions.'}
            </p>
            {reference && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <span className="font-medium">Reference:</span> {reference}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button onClick={() => navigate('/')} variant="outline">
              Return Home
            </Button>
            <Button onClick={() => navigate('/marketplace')}>
              Browse Apps
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
