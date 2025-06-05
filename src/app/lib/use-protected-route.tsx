'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth-context';
import { UserRole, Country } from '../types/auth';

type WithAuthOptions = {
  requiredRoles?: UserRole[];
  allowedCountries?: Country[];
  redirectTo?: string;
};

export const useProtectedRoute = ({
  requiredRoles = [],
  allowedCountries = [],
  redirectTo = '/auth/login',
}: WithAuthOptions = {}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If still loading auth state, do nothing yet
    if (loading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    // If user doesn't have required role, redirect
    if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role as UserRole)) {
      router.replace('/dashboard');
      return;
    }

    // If user doesn't have access to the country-specific data, redirect
    if (allowedCountries.length > 0 && user) {
      // Admin has global access
      if (user.role === 'admin') return;
      
      // Check if user's country is allowed
      if (!allowedCountries.includes(user.country as Country)) {
        router.replace('/dashboard');
        return;
      }
    }
  }, [loading, isAuthenticated, user, requiredRoles, allowedCountries, redirectTo, router]);
  return { user, loading };
};
