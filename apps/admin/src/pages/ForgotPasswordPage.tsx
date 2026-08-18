import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@repo/ui';
import { publicApiFetch } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { supabase, isAdmin } from '@/lib/supabase';
import { Logo } from '@/components/shared/Logo';

const requestSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

const resetSchema = z
  .object({
    token: z.string().min(6, 'Enter the 6-digit code').max(10),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RequestValues = z.infer<typeof requestSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requestForm = useForm<RequestValues>({ resolver: zodResolver(requestSchema) });
  const resetForm = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  const onRequest = async (values: RequestValues) => {
    setSubmitting(true);
    try {
      const result = await publicApiFetch<{ message: string }>(
        API_ENDPOINTS.adminAuth.forgotPassword,
        { method: 'POST', body: JSON.stringify({ email: values.email }) },
      );
      setEmail(values.email);
      setStep('reset');
      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send code');
    } finally {
      setSubmitting(false);
    }
  };

  // verifyOtp exchanges the recovery code for a session, which is what lets
  // updateUser set the new password.
  const onReset = async (values: ResetValues) => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: values.token.trim(),
        type: 'recovery',
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (!isAdmin(data.user)) {
        await supabase.auth.signOut();
        toast.error('This account does not have admin access.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (updateError) {
        toast.error(updateError.message);
        return;
      }

      toast.success('Password updated');
      navigate('/', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-3">
          <Logo className="h-9" />
          <div className="space-y-1">
            <CardTitle>Reset password</CardTitle>
            <CardDescription>
              {step === 'request'
                ? 'We will email you a verification code.'
                : `Enter the code sent to ${email} and choose a new password.`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'request' ? (
            <form onSubmit={requestForm.handleSubmit(onRequest)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@fmtsoftware.com"
                  {...requestForm.register('email')}
                />
                {requestForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {requestForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Send code
              </Button>
            </form>
          ) : (
            <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="token">Verification code</Label>
                <Input
                  id="token"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  {...resetForm.register('token')}
                />
                {resetForm.formState.errors.token && (
                  <p className="text-sm text-destructive">
                    {resetForm.formState.errors.token.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...resetForm.register('password')}
                />
                {resetForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {resetForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...resetForm.register('confirmPassword')}
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Update password
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('request')}
                disabled={submitting}
              >
                Use a different email
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <ArrowLeft className="size-3" />
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
