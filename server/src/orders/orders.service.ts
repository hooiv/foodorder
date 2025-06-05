import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { User, UserRole, Country } from '../entities/user.entity';
import { MenuService } from '../menu/menu.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private menuService: MenuService,
    private usersService: UsersService,
  ) {}

  async findAll(userId: string, userRole: UserRole, userCountry: Country): Promise<Order[]> {
    // Admin can see all orders
    if (userRole === UserRole.ADMIN) {
      return this.orderRepository.find({
        relations: ['user', 'items', 'items.menuItem'],
      });
    }
      // Manager can see orders from their country
    if (userRole === UserRole.MANAGER) {
      const users = await this.usersService.findAllByCountry(userCountry);
      const userIds = users.map(user => user.id);
      
      return this.orderRepository.find({
        where: { user: { id: In(userIds) } },
        relations: ['user', 'items', 'items.menuItem'],
      });
    }
    
    // Members can see only their orders
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.menuItem'],
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole, userCountry: Country): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.menuItem'],
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    // Admin can see any order
    if (userRole === UserRole.ADMIN) {
      return order;
    }
    
    // Manager can see orders from their country
    if (userRole === UserRole.MANAGER) {
      const orderUser = await this.usersService.findOne(order.user.id);
      if (orderUser.country === userCountry || userCountry === Country.GLOBAL) {
        return order;
      }
      throw new ForbiddenException('You do not have permission to access this order');
    }
    
    // Members can only see their own orders
    if (order.user.id !== userId) {
      throw new ForbiddenException('You do not have permission to access this order');
    }
    
    return order;
  }

  async createOrder(userId: string): Promise<Order> {
    const user = await this.usersService.findOne(userId);
    
    const order = this.orderRepository.create({
      status: OrderStatus.CART,
      user,
      items: [],
      total: 0,
    });
    
    return this.orderRepository.save(order);
  }
  async addItemToOrder(
    orderId: string,
    itemData: any,
    userId: string,
    userCountry: Country,
  ): Promise<Order> {
    // Get the user to determine their role
    const user = await this.usersService.findOne(userId);
    
    // Use the user's actual role instead of always ADMIN
    const order = await this.findOne(orderId, userId, user.role, userCountry);
    
    if (order.status !== OrderStatus.CART) {
      throw new ForbiddenException('Cannot add items to a placed order');
    }
    
    try {
      const menuItem = await this.menuService.findOne(itemData.menuItemId, userCountry);
      
      const orderItem = this.orderItemRepository.create({
        menuItem,
        order,
        quantity: itemData.quantity || 1,
        priceAtOrder: menuItem.price,
        specialInstructions: itemData.specialInstructions || '',
      });
        await this.orderItemRepository.save(orderItem);
      
      // Update order total - ensure all values are numbers with proper fallbacks      // Ensure all values are proper numbers
      const itemPrice = typeof menuItem.price === 'string' ? parseFloat(menuItem.price) : (menuItem.price || 0);
      const itemQuantity = typeof itemData.quantity === 'string' ? parseInt(itemData.quantity, 10) : (itemData.quantity || 1);
      const currentTotal = typeof order.total === 'string' ? parseFloat(order.total) : (order.total || 0);
      
      // Calculate the new total safely as a number with proper decimal precision
      const newTotal = +(currentTotal + (itemPrice * itemQuantity)).toFixed(2);
      
      console.log(`Updating order total: ${currentTotal} + (${itemPrice} * ${itemQuantity}) = ${order.total}`);
      
      // Add the new item to the items array
      if (!order.items) {
        order.items = [];
      }
      order.items.push(orderItem);
      
      return this.orderRepository.save(order);
    } catch (error) {
      console.error('Error in addItemToOrder:', error);
      throw error;
    }
  }

  async removeItemFromOrder(
    orderId: string,
    orderItemId: string,
    userId: string,
    userRole: UserRole,
    userCountry: Country,
  ): Promise<Order> {
    const order = await this.findOne(orderId, userId, userRole, userCountry);
    
    if (order.status !== OrderStatus.CART) {
      throw new ForbiddenException('Cannot remove items from a placed order');
    }
    
    const orderItem = order.items.find(item => item.id === orderItemId);
    
    if (!orderItem) {
      throw new NotFoundException(`Order item with ID ${orderItemId} not found in order`);
    }
    
    // Update order total
    order.total = order.total - (orderItem.priceAtOrder * orderItem.quantity);
    
    // Remove the item
    await this.orderItemRepository.remove(orderItem);
    
    // Reload the order with updated items
    return this.findOne(orderId, userId, userRole, userCountry);
  }  async placeOrder(
    orderId: string,
    paymentData: any,
    userId: string,
    userRole: UserRole,
    userCountry: Country,
  ): Promise<Order> {
    const order = await this.findOne(orderId, userId, userRole, userCountry);
    
    if (order.status !== OrderStatus.CART) {
      throw new ForbiddenException('Order has already been placed');
    }
    
    if (!order.items || order.items.length === 0) {
      throw new ForbiddenException('Cannot place an empty order');
    }
    
    // Only Admin and Managers can place orders
    if (userRole === UserRole.MEMBER) {
      throw new ForbiddenException('Team Members cannot place orders');
    }
    
    // Check if paymentMethod is provided
    if (!paymentData || !paymentData.paymentMethod) {
      throw new ForbiddenException('Payment method is required');
    }
    
    // Update order status and payment information
    order.status = OrderStatus.PLACED;
    order.paymentMethod = paymentData.paymentMethod;
    order.paymentId = paymentData.paymentId || `payment_${Date.now()}`;
    
    return this.orderRepository.save(order);
  }

  async cancelOrder(
    orderId: string,
    userId: string,
    userRole: UserRole,
    userCountry: Country,
  ): Promise<Order> {
    const order = await this.findOne(orderId, userId, userRole, userCountry);
    
    if (order.status === OrderStatus.COMPLETED) {
      throw new ForbiddenException('Cannot cancel a completed order');
    }
    
    if (order.status === OrderStatus.CANCELLED) {
      throw new ForbiddenException('Order is already cancelled');
    }
    
    // Only Admin and Managers can cancel orders
    if (userRole === UserRole.MEMBER) {
      throw new ForbiddenException('Team Members cannot cancel orders');
    }
    
    order.status = OrderStatus.CANCELLED;
    
    return this.orderRepository.save(order);
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    userId: string,
    userRole: UserRole,
    userCountry: Country,
  ): Promise<Order> {
    const order = await this.findOne(orderId, userId, userRole, userCountry);
    
    // Only Admin can update order status
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only Admin can update order status');
    }
    
    order.status = status;
    
    return this.orderRepository.save(order);
  }
}
