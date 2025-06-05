'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProtectedRoute } from '../lib/use-protected-route';
import { orderApi } from '../lib/api';
import { Order, OrderStatus, UserRole } from '../types/auth';
import toast from 'react-hot-toast';

export default function Orders() {
  // Protect this route - all authenticated users can access
  const { user } = useProtectedRoute();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getAll();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on status
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  // Handle order cancellation
  const handleCancelOrder = async (orderId: string) => {
    if (user?.role === UserRole.MEMBER) {
      toast.error('You do not have permission to cancel orders');
      return;
    }
    
    try {
      await orderApi.cancelOrder(orderId);
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: OrderStatus.CANCELLED } 
            : order
        )
      );
      
      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          
          {/* Status filter */}
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <label htmlFor="status" className="sr-only">Status</label>
            <select
              id="status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as OrderStatus | 'all')}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="mt-6 text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <li key={order.id}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            Order #{order.id.substring(0, 8)}
                          </p>
                          <div className="sm:ml-4 mt-1 sm:mt-0">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.status === 'delivered' 
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 text-sm text-gray-500">
                            ${typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : Number(order.totalAmount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {order.restaurant?.name}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <div className="flex space-x-2">
                            <Link 
                              href={`/orders/${order.id}`}
                              className="font-medium text-blue-600 hover:text-blue-500"
                            >
                              View
                            </Link>
                            
                            {/* Cancel button - only for Admin/Manager and non-cancelled/delivered orders */}
                            {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && 
                             ['pending', 'confirmed', 'preparing'].includes(order.status) && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="font-medium text-red-600 hover:text-red-500"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
