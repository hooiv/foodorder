'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '../../lib/use-protected-route';
import { orderApi } from '../../lib/api';
import { Order, OrderStatus, UserRole } from '../../types/auth';
import toast from 'react-hot-toast';
import React from 'react';

// Remove custom PageProps import and use type directly with any
export default function OrderDetail({
  params,
  searchParams // Add searchParams here
}: {
  params: any;
  searchParams?: Promise<any>; // Align with Vercel's expected Promise type
}) {
  // Protect this route - all authenticated users can access
  const { user } = useProtectedRoute();  const router = useRouter();
  // Follow Next.js best practice by using React.use() with any for Vercel compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unwrappedParams = React.use(params);
  // const unwrappedSearchParams = React.use(searchParams); // Uncomment if you need to unwrap searchParams
  const { id } = unwrappedParams;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getById(id) as Order;
        // Map API response items field to orderItems for frontend consistency
        if (data && data.items && !data.orderItems) {
          data.orderItems = data.items;
        }
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [id, router]);

  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (!order) return;
    
    if (user?.role === UserRole.MEMBER) {
      toast.error('You do not have permission to cancel orders');
      return;
    }

    try {
      await orderApi.cancelOrder(order.id);
      
      // Update local state
      setOrder(prev => prev ? { ...prev, status: OrderStatus.CANCELLED } : null);
      
      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="ml-3">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Order not found</p>
        <button 
          onClick={() => router.push('/orders')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  // Make sure we have an orderItems array to work with
  const orderItems = order.orderItems || order.items || [];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between md:space-x-5">
          <div className="flex items-start space-x-5">
            <div className="pt-1.5">
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.substring(0, 8)}</h1>
              <p className="text-sm font-medium text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
            <button
              onClick={() => router.push('/orders')}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Orders
            </button>
            
            {/* Cancel button - only for Admin/Manager and non-cancelled/delivered orders */}
            {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && 
             ['pending', 'confirmed', 'preparing'].includes(order.status) && (
              <button
                onClick={handleCancelOrder}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
        
        {/* Order status */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Order Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {order.restaurant ? `From ${order.restaurant.name}` : 'Order details'}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Order Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </dd>
              </div>              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                  ${(order.totalAmount || order.total) ? 
                    (typeof order.totalAmount === 'number' ? 
                      order.totalAmount.toFixed(2) : 
                      typeof order.total === 'number' ? 
                        order.total.toFixed(2) : 
                        Number(order.totalAmount || order.total).toFixed(2)) : 
                    '0.00'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Order items */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Order Items</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {orderItems.length > 0 ? (
                orderItems.map((item) => (
                  <li key={item.id} className="px-4 py-4">
                    <div className="flex justify-between">
                      <div className="flex">
                        <span className="font-medium">{item.quantity} x</span>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{item.menuItem?.name || 'Unknown item'}</p>
                          <p className="text-sm text-gray-500">
                            {item.menuItem?.isVegetarian && <span className="mr-2">🟢 Veg</span>}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(item.quantity * Number(item.price)).toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 text-center text-gray-500">No items in this order</li>
              )}
            </ul>
          </div>          <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Total</p>
              <p>
                ${(order.totalAmount || order.total) ? 
                  (typeof order.totalAmount === 'number' ? 
                    order.totalAmount.toFixed(2) : 
                    typeof order.total === 'number' ? 
                      order.total.toFixed(2) : 
                      Number(order.totalAmount || order.total).toFixed(2)) : 
                  '0.00'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Delivery information */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Delivery Information</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Restaurant</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{order.restaurant?.name || 'Not available'}</dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{order.restaurant?.address || 'Not available'}</dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Country</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{order.restaurant?.country || 'Not available'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
