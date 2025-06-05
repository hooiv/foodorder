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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CountryGuard } from '../auth/country.guard';
import { RequireCountry } from '../auth/countries.decorator';

@ApiTags('menu')
@Controller('menu')
@UseGuards(JwtAuthGuard, RolesGuard, CountryGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'Get menu items by restaurant' })
  @ApiQuery({ name: 'restaurantId', required: true })
  findAllByRestaurant(@Query('restaurantId') restaurantId: string, @Request() req) {
    return this.menuService.findAllByRestaurant(restaurantId, req.user.country);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu item by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.menuService.findOne(id, req.user.country);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new menu item (Admin only)' })
  create(@Body() createMenuItemDto: any, @Request() req) {
    return this.menuService.create(createMenuItemDto, req.user.country);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a menu item (Admin only)' })
  update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: any,
    @Request() req,
  ) {
    return this.menuService.update(id, updateMenuItemDto, req.user.country);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a menu item (Admin only)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.menuService.remove(id, req.user.country);
  }

  @Post('seed/:restaurantId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Seed menu items for a restaurant (Admin only)' })
  seedMenuItems(@Param('restaurantId') restaurantId: string, @Request() req) {
    return this.menuService.seedMenuItems(restaurantId, req.user.country);
  }
}
