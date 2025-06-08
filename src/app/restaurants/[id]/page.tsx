'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useProtectedRoute } from '../../lib/use-protected-route';
import { restaurantApi, menuApi } from '../../lib/api';
import { Restaurant, MenuItem } from '../../types/auth';
import toast from 'react-hot-toast';
import React from 'react';

import { IdParams, RouteParams } from '../../types/react-extensions';

// Define page props using our custom types
interface PageProps {
  params: IdParams | RouteParams;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function RestaurantDetail({ params }: PageProps) {
  // Protect this route - all authenticated users can access
  useProtectedRoute();  const router = useRouter();
  // Use React.use() to unwrap params safely
  const unwrappedParams = React.use(params) as IdParams;
  const { id } = unwrappedParams;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<{[key: string]: { item: MenuItem, quantity: number }}>({});

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        
        // Fetch restaurant details
        const restaurantData = await restaurantApi.getById(id) as Restaurant;
        setRestaurant(restaurantData);
          // Fetch menu items
        const menuData = await menuApi.getByRestaurant(id) as MenuItem[];
        setMenuItems(menuData);
        
        // Set initial active category
        if (menuData.length > 0) {
          const categories = [...new Set(menuData.map((item: MenuItem) => item.category))];
          setActiveCategory(categories[0] as string);
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        router.push('/restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [id, router]);
  // Get unique categories from menu items
  const categories = [...new Set(menuItems.map((item: MenuItem) => item.category))];

  // Filter menu items by active category
  const filteredMenuItems = activeCategory 
    ? menuItems.filter((item: MenuItem) => item.category === activeCategory)
    : menuItems;

  // Add item to cart
  const addToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existingItem = prev[item.id];
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: existingItem ? existingItem.quantity + 1 : 1
        }
      };
    });
    toast.success(`Added ${item.name} to cart`);
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCartItems(prev => {
      const existingItem = prev[itemId];
      
      if (!existingItem || existingItem.quantity <= 1) {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      }
      
      return {
        ...prev,
        [itemId]: {
          ...existingItem,
          quantity: existingItem.quantity - 1
        }
      };
    });
  };

  // Calculate total items in cart
  const totalCartItems = Object.values(cartItems).reduce((sum, { quantity }) => sum + quantity, 0);
  // Calculate total price
  const totalPrice = Object.values(cartItems).reduce(
    (sum, { item, quantity }) => sum + Number(item.price) * quantity, 
    0
  );

  // Handle checkout
  const handleCheckout = () => {
    // Save cart to localStorage or state management before navigating
    localStorage.setItem('cart', JSON.stringify({
      restaurantId: id,
      items: cartItems,
      totalPrice
    }));
    
    router.push('/orders/checkout');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="ml-3">Loading restaurant details...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Restaurant not found</p>
        <button 
          onClick={() => router.push('/restaurants')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Restaurant header */}
        <div className="bg-white overflow-hidden shadow-lg rounded-lg">          <div className="h-64 w-full overflow-hidden relative">
            <Image
              src={restaurant.imageUrl || 'https://via.placeholder.com/1200x400?text=Restaurant+Image'}
              alt={restaurant.name}
              fill={true}
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div className="px-6 py-5">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                <p className="mt-2 text-gray-600">{restaurant.description}</p>
                <p className="mt-2 text-sm text-gray-500">{restaurant.address}</p>
              </div>
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                {restaurant.country}
              </span>
            </div>
          </div>
        </div>
        
        {/* Menu navigation */}
        <div className="mt-6 bg-white shadow rounded-lg overflow-x-auto">          <nav className="flex px-4 border-b border-gray-200">
            {categories.map((category, index) => (
              <button
                key={`${category}-${index}`}
                onClick={() => setActiveCategory(category)}
                className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                  activeCategory === category
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Menu items */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">          {filteredMenuItems.map((item, index) => (
            <div
              key={item.id || `menu-item-${index}`}
              className="bg-white overflow-hidden shadow rounded-lg flex flex-col"
            >              <div className="h-48 w-full overflow-hidden relative">
                <Image
                  src={item.imageUrl || `https://via.placeholder.com/300x200?text=${encodeURIComponent(item.name)}`}
                  alt={item.name}
                  fill={true}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="px-4 py-4 flex-grow">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>                  <div className="flex items-center">
                    {item.isVegetarian && (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10 mr-2">
                        Veg
                      </span>
                    )}
                    <span className="font-medium text-gray-900">${typeof item.price === 'number' ? item.price.toFixed(2) : Number(item.price).toFixed(2)}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 line-clamp-3">{item.description}</p>
              </div>
              <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                {cartItems[item.id] ? (
                  <div className="flex items-center">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-4">{cartItems[item.id].quantity}</span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart(item)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Cart summary (fixed at bottom) */}
        {totalCartItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 px-4 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">              <div>
                <span className="text-lg font-medium">{totalCartItems} item{totalCartItems !== 1 ? 's' : ''}</span>
                <p className="text-sm text-gray-500">Total: ${Number(totalPrice).toFixed(2)}</p>
              </div>
              <button 
                onClick={handleCheckout}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
