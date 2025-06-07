'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '../../lib/use-protected-route';
import { restaurantApi, orderApi } from '../../lib/api';
import { Restaurant, MenuItem, UserRole } from '../../types/auth';
import toast from 'react-hot-toast';

type CartItem = {
  item: MenuItem;
  quantity: number;
};

type Cart = {
  restaurantId: string;
  items: { [key: string]: CartItem };
  totalPrice: number;
};

export default function Checkout() {
  // Protect this route - only Admin and Manager can checkout
  const { user } = useProtectedRoute({
    requiredRoles: [UserRole.ADMIN, UserRole.MANAGER],
    redirectTo: '/dashboard',
  });
  
  const router = useRouter();
  
  const [cart, setCart] = useState<Cart | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const loadCartData = async () => {
      try {
        setLoading(true);
        
        // Get cart from localStorage
        const cartData = localStorage.getItem('cart');
        if (!cartData) {
          toast.error('No items in cart');
          router.push('/restaurants');
          return;
        }
        
        const parsedCart: Cart = JSON.parse(cartData);
        setCart(parsedCart);
        
        // Fetch restaurant details
        const restaurantData = await restaurantApi.getById(parsedCart.restaurantId);
        setRestaurant(restaurantData as Restaurant);
      } catch (error) {
        console.error('Error loading cart data:', error);
        toast.error('Error loading cart data');
      } finally {
        setLoading(false);
      }
    };

    loadCartData();
  }, [router]);  const handlePlaceOrder = async () => {
    if (!cart || !user) return;
    
    try {
      setPlacingOrder(true);
      toast.loading('Creating your order...');
      
      // First create the order
      const order = await orderApi.create() as { id: string };
      
      // Track successful items
      let addedItemsCount = 0;
      
      // Then add each item to the order with proper error handling      
      for (const { item, quantity } of Object.values(cart.items)) {
        try {
          await orderApi.addItem(order.id, item.id, quantity);
          addedItemsCount++;
        } catch (error: unknown) {
          console.error(`Error adding item ${item.id} to order:`, error);
          // Continue with other items instead of throwing error
          toast.error(`Item "${item.name}" could not be added to your order.`);
        }
      }
      
      if (addedItemsCount === 0) {
        toast.dismiss();
        toast.error('No items could be added to your order.');
        return;
      }
      
      toast.loading('Finalizing your order...');
      
      // Then place the order (change status from cart to placed)
      await orderApi.placeOrder(order.id, 'credit_card');
      
      // Clear cart from localStorage
      localStorage.removeItem('cart');
      
      toast.dismiss();
      toast.success('Order placed successfully!');
      router.push(`/orders/${order.id}`);
    } catch (error: unknown) {
      toast.dismiss();
      console.error('Error placing order:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="ml-3">Loading checkout...</p>
      </div>
    );
  }

  if (!cart || !restaurant || Object.keys(cart.items).length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Your cart is empty</p>
        <button 
          onClick={() => router.push('/restaurants')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
        
        {/* Order summary */}
        <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-5">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
            <p className="mt-1 text-sm text-gray-500">Restaurant: {restaurant.name}</p>
          </div>
          <div className="border-t border-gray-200 px-6 py-5">
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {Object.values(cart.items).map(({ item, quantity }) => (
                  <li key={item.id} className="py-3 flex justify-between">
                    <div className="flex">
                      <span className="font-medium">{quantity} x</span>                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.isVegetarian && <span className="mr-2">🟢 Veg</span>}
                          ${Number(item.price).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">${(Number(item.price) * quantity).toFixed(2)}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 px-6 py-5">            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Total</p>
              <p>${Number(cart.totalPrice).toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        {/* Payment method section */}
        <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-5">
            <h2 className="text-lg font-medium text-gray-900">Payment Method</h2>
            <p className="mt-1 text-sm text-gray-500">
              Payment will be processed using your default payment method
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-900">Default Payment Method</p>
              <p className="text-sm text-gray-500">
                Credit Card ending in •••• 1234
              </p>
              <button
                onClick={() => router.push('/profile/payment')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-500"
              >
                Change payment method
              </button>
            </div>
          </div>
        </div>
        
        {/* Place order button */}
        <div className="mt-6 flex justify-end">
          <button 
            onClick={() => router.push(`/restaurants/${cart.restaurantId}`)}
            className="px-4 py-2 mr-4 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Restaurant
          </button>
          <button 
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {placingOrder ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
