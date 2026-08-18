import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, signOut } from '@/hooks/use-auth';

export function ProtectedRoute() {
  const { session, isAdmin, loading } = useAuth();
  const location = useLocation();

  // A valid session without the admin claim is useless here — drop it so the
  // user isn't stuck in a signed-in-but-locked-out state.
  useEffect(() => {
    if (!loading && session && !isAdmin) {
      toast.error('This account does not have admin access.');
      void signOut();
    }
  }, [loading, session, isAdmin]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session || !isAdmin) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
