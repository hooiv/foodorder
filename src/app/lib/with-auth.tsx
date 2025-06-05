"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { useEffect } from 'react';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  roles?: string[]
) {
  return function ProtectedRoute(props: P) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Wait until authentication check is complete
      if (!loading) {
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
          router.push('/auth/login');
        } 
        // Check role permissions if required
        else if (roles && user && !roles.includes(user.role)) {
          router.push('/dashboard'); // Redirect to dashboard if wrong role
        }
      }
    }, [loading, isAuthenticated, router, user, roles]);

    // Show nothing while checking authentication
    if (loading || !isAuthenticated || (roles && user && !roles.includes(user.role))) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return <Component {...props} />;
  };
}
