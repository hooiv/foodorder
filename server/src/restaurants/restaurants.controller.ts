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
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CountryGuard } from '../auth/country.guard';
import { RequireCountry } from '../auth/countries.decorator';

@ApiTags('restaurants')
@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard, CountryGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all restaurants' })
  findAll(@Request() req) {
    // Filter restaurants based on user's country
    return this.restaurantsService.findAll(req.user.country);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a restaurant by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.restaurantsService.findOne(id, req.user.country);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new restaurant (Admin only)' })
  create(@Body() createRestaurantDto: any) {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a restaurant (Admin only)' })
  update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: any,
    @Request() req,
  ) {
    return this.restaurantsService.update(id, updateRestaurantDto, req.user.country);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a restaurant (Admin only)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.restaurantsService.remove(id, req.user.country);
  }
}
