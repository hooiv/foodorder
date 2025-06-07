'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProtectedRoute } from '../lib/use-protected-route';
import { restaurantApi } from '../lib/api';
import { Restaurant, Country } from '../types/auth';

export default function Restaurants() {
  // Protect this route - all authenticated users can access
  useProtectedRoute();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await restaurantApi.getAll();
        setRestaurants(data as Restaurant[]);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Restaurants</h1>
        </div>
        
        {loading ? (
          <div className="mt-6 text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Loading restaurants...</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="mt-6 text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No restaurants found</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <Link 
                href={`/restaurants/${restaurant.id}`}
                key={restaurant.id}
                className="block hover:shadow-lg transition duration-300"
              >
                <div className="bg-white overflow-hidden shadow rounded-lg h-full">
                  <div className="h-48 w-full overflow-hidden">                    <img 
                      src={restaurant.imageUrl || 'https://via.placeholder.com/400x200?text=Restaurant+Image'} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">{restaurant.name}</h3>
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                        {restaurant.country}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{restaurant.description}</p>
                    <p className="mt-3 text-sm text-gray-500">{restaurant.address}</p>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm text-blue-600 font-medium">
                      View Menu →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
