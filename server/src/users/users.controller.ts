import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, Country } from '../entities/user.entity';
import { RequireCountry } from '../auth/countries.decorator';
import { CountryGuard } from '../auth/country.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, CountryGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequireCountry(true)
  @ApiOperation({ summary: 'Get all users (Admin/Manager only)' })
  async findAll(@Request() req) {
    if (req.user.role === UserRole.ADMIN) {
      return this.usersService.findAll();
    } else {
      // Managers can only see users from their country
      return this.usersService.findAllByCountry(req.user.country);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @RequireCountry(true)
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findOne(id);
    
    // Admin can see all users
    if (req.user.role === UserRole.ADMIN) {
      return user;
    }
    
    // Others can only see users from their country
    if (user.country !== req.user.country && req.user.country !== Country.GLOBAL) {
      throw new ForbiddenException('You do not have access to users from other countries');
    }
    
    return user;
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new user (Admin/Manager only)' })
  create(@Body() createUserDto: any, @Request() req) {
    // If the request is from a manager, ensure they can only create users for their country
    if (req.user.role === UserRole.MANAGER && createUserDto.country !== req.user.country) {
      throw new ForbiddenException('You can only create users for your country');
    }
    
    // Managers cannot create admin users
    if (req.user.role === UserRole.MANAGER && createUserDto.role === UserRole.ADMIN) {
      throw new ForbiddenException('You cannot create admin users');
    }
    
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequireCountry(true)
  @ApiOperation({ summary: 'Update a user (Admin/Manager only)' })
  async update(@Param('id') id: string, @Body() updateUserDto: any, @Request() req) {
    const user = await this.usersService.findOne(id);
    
    // Admin can update any user
    if (req.user.role === UserRole.ADMIN) {
      return this.usersService.updateUser(id, updateUserDto);
    }
    
    // Managers can only update users from their country
    if (user.country !== req.user.country) {
      throw new ForbiddenException('You can only update users from your country');
    }
    
    // Managers cannot change a user's role to admin
    if (updateUserDto.role === UserRole.ADMIN) {
      throw new ForbiddenException('You cannot assign admin role');
    }
    
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Patch(':id/payment-method')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user payment method (Admin only)' })
  updatePaymentMethod(
    @Param('id') id: string, 
    @Body() paymentData: { paymentMethod: string },
    @Request() req,
  ) {
    return this.usersService.updatePaymentMethod(
      id, 
      paymentData.paymentMethod, 
      req.user.role
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
