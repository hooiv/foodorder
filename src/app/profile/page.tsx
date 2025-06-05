'use client';

import { useState } from 'react';
import { useProtectedRoute } from '../lib/use-protected-route';
import { useAuth } from '../context/auth-context';
import { UserRole, Country } from '../types/auth';

export default function Profile() {
  // Protect this route - all authenticated users can access
  const { user } = useProtectedRoute();
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800 ring-purple-600/20';
      case UserRole.MANAGER:
        return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      case UserRole.MEMBER:
        return 'bg-green-100 text-green-800 ring-green-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };
  
  const getCountryBadgeColor = (country: string) => {
    switch (country) {
      case Country.GLOBAL:
        return 'bg-purple-100 text-purple-800 ring-purple-600/20';
      case Country.INDIA:
        return 'bg-orange-100 text-orange-800 ring-orange-600/20';
      case Country.AMERICA:
        return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        
        {/* User profile information */}
        <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-gray-900">{user?.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ${getRoleBadgeColor(user?.role || '')}`}>
                  {user?.role}
                </span>
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ${getCountryBadgeColor(user?.country || '')}`}>
                  {user?.country}
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Access Level</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.role === UserRole.ADMIN && 'Global access to all features'}
                  {user?.role === UserRole.MANAGER && `Manager access for ${user?.country}`}
                  {user?.role === UserRole.MEMBER && `Member access for ${user?.country}`}
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Permissions</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>View restaurants & menu items</li>
                    <li>Create order (add food items)</li>
                    {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && (
                      <>
                        <li>Place order (checkout & pay)</li>
                        <li>Cancel order</li>
                      </>
                    )}
                    {user?.role === UserRole.ADMIN && (
                      <li>Update payment methods</li>
                    )}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Actions section */}
        <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Account Actions</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="space-y-4">
              <div>
                <a 
                  href="/profile/payment" 
                  className={`text-sm font-medium text-blue-600 hover:text-blue-500 ${user?.role !== UserRole.ADMIN ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  Manage Payment Methods
                </a>
                {user?.role !== UserRole.ADMIN && (
                  <p className="mt-1 text-xs text-gray-500">Only admins can manage payment methods.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
