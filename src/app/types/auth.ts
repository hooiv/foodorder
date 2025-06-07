// User types
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager', 
  MEMBER = 'member',
}

export enum Country {
  GLOBAL = 'global',
  INDIA = 'india',
  AMERICA = 'america',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  country: Country;
}

// Restaurant and menu types
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  imageUrl: string;
  country: Country;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  restaurantId: string;
  category: string;
  isVegetarian: boolean;
}

// Order types
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurant?: Restaurant;
  orderItems?: OrderItem[];
  items?: OrderItem[]; // Backend response uses items
  status: OrderStatus;
  totalAmount?: number; // Frontend property
  total?: number;      // Backend property
  createdAt: string;
  updatedAt: string;
}

// Payment types
export interface PaymentMethod {
  id: string;
  userId: string;
  cardNumber: string; // Last 4 digits only
  cardType: string;
  isDefault: boolean;
}
