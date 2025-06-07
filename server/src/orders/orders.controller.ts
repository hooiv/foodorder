import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Patch,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { OrderStatus } from '../entities/order.entity';
import { CountryGuard } from '../auth/country.guard';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard, CountryGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders based on user role and country' })
  findAll(@Request() req) {
    return this.ordersService.findAll(
      req.user.userId, 
      req.user.role, 
      req.user.country
    );
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent orders with optional limit parameter' })
  findRecent(@Request() req, @Query('limit') limit?: number) {
    const limitValue = limit ? parseInt(limit.toString(), 10) : 5;
    return this.ordersService.findRecent(
      req.user.userId,
      req.user.role,
      req.user.country,
      limitValue
    );
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.ordersService.findOne(
      id, 
      req.user.userId, 
      req.user.role, 
      req.user.country
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order (cart)' })
  create(@Request() req) {
    return this.ordersService.createOrder(req.user.userId);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add an item to an order' })
  addItemToOrder(
    @Param('id') id: string,
    @Body() itemData: any,
    @Request() req,
  ) {
    return this.ordersService.addItemToOrder(
      id, 
      itemData, 
      req.user.userId, 
      req.user.country
    );
  }

  @Delete(':orderId/items/:itemId')
  @ApiOperation({ summary: 'Remove an item from an order' })
  removeItemFromOrder(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Request() req,
  ) {
    return this.ordersService.removeItemFromOrder(
      orderId, 
      itemId, 
      req.user.userId, 
      req.user.role, 
      req.user.country
    );
  }

  @Post(':id/place')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Place an order (checkout and pay)' })
  placeOrder(
    @Param('id') id: string,
    @Body() paymentData: any,
    @Request() req,
  ) {
    return this.ordersService.placeOrder(
      id, 
      paymentData, 
      req.user.userId, 
      req.user.role, 
      req.user.country
    );
  }

  @Post(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cancel an order' })
  cancelOrder(@Param('id') id: string, @Request() req) {
    return this.ordersService.cancelOrder(
      id, 
      req.user.userId, 
      req.user.role, 
      req.user.country
    );
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  updateOrderStatus(
    @Param('id') id: string,
    @Body() statusData: { status: OrderStatus },
    @Request() req,
  ) {
    return this.ordersService.updateOrderStatus(
      id, 
      statusData.status, 
      req.user.userId, 
      req.user.role, 
      req.user.country
    );
  }
}
