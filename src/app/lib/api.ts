import axios from 'axios';
import { Restaurant, Order } from '../types/auth'; // Import Restaurant and Order types

// Configure Axios defaults
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

// Add token from localStorage to requests
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

// API service for authentication
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await axios.post('/auth/login', { email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await axios.get('/auth/profile');
    return response.data;
  },
};

// API service for restaurants
export const restaurantApi = {
  getAll: async (): Promise<Restaurant[]> => { // Add return type Promise<Restaurant[]>
    const response = await axios.get<Restaurant[]>('/restaurants'); // Specify type for axios.get
    return response.data;
  },
  getById: async (id: string): Promise<Restaurant> => { // Add return type Promise<Restaurant>
    const response = await axios.get<Restaurant>(`/restaurants/${id}`); // Specify type for axios.get
    return response.data;
  },
};

// API service for menu items
export const menuApi = {
  getByRestaurant: async (restaurantId: string) => {
    const response = await axios.get(`/menu?restaurantId=${restaurantId}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axios.get(`/menu/${id}`);
    return response.data;
  },
};

// API service for orders
export const orderApi = {
  getAll: async (): Promise<Order[]> => { // Add return type Promise<Order[]>
    const response = await axios.get<Order[]>('/orders'); // Specify type for axios.get
    return response.data;
  },
  getRecent: async (limit = 5): Promise<Order[]> => { // Add return type Promise<Order[]>
    const response = await axios.get<Order[]>(`/orders/recent?limit=${limit}`); // Specify type for axios.get
    return response.data;
  },  getById: async (id: string): Promise<Order> => { // Add return type Promise<Order>
    const response = await axios.get<Order>(`/orders/${id}`); // Specify type for axios.get
    return response.data;
  },
  create: async (data = {}): Promise<Order> => { // Add return type Promise<Order>
    // The backend creates an empty cart order with the user ID from the JWT token
    try {
      const response = await axios.post<Order>('/orders', data); // Specify type for axios.post
      return response.data;    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: unknown }; message?: string };
      console.error('Error creating order:', axiosError.response?.data || axiosError.message);
      throw error;
    }  },
  addItem: async (orderId: string, menuItemId: string, quantity: number, specialInstructions?: string): Promise<Order> => { // Add return type Promise<Order>
    if (!orderId || !menuItemId) {
      throw new Error('Missing required parameters: orderId and menuItemId are required');
    }
    
    try {
      const payload = {
        menuItemId,
        quantity: quantity || 1,
        specialInstructions: specialInstructions || '',
      };
      const response = await axios.post<Order>(`/orders/${orderId}/items`, payload); // Specify type for axios.post
      return response.data;    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: unknown }; message?: string };
      console.error('Error adding item to order:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },
  removeItem: async (orderId: string, itemId: string): Promise<Order> => { // Add return type Promise<Order>
    try {
      const response = await axios.delete<Order>(`/orders/${orderId}/items/${itemId}`); // Specify type for axios.delete
      return response.data;    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: unknown }; message?: string };
      console.error('Error removing item from order:', axiosError.response?.data || axiosError.message);
      throw error;
    }  },
  placeOrder: async (orderId: string, paymentMethod: string): Promise<Order> => { // Add return type Promise<Order>
    try {
      const response = await axios.post<Order>(`/orders/${orderId}/place`, {
        paymentMethod,
        paymentId: `payment_${Date.now()}` // Generate a dummy paymentId
      });
      return response.data;    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: unknown }; message?: string };
      console.error('Error placing order:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },
  cancelOrder: async (orderId: string): Promise<Order> => { // Add return type Promise<Order>
    try {
      const response = await axios.post<Order>(`/orders/${orderId}/cancel`); // Specify type for axios.post
      return response.data;    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: unknown }; message?: string };
      console.error('Error cancelling order:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },
};

// API service for payments
export const paymentApi = {
  getUserPaymentMethod: async (userId: string) => {
    const response = await axios.get(`/payments/${userId}`);
    return response.data;
  },
  updateUserPaymentMethod: async (userId: string, paymentMethod: string) => {
    const response = await axios.post(`/payments/${userId}`, { paymentMethod });
    return response.data;
  },
};
