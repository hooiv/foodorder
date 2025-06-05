import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { RestaurantsService } from './restaurants/restaurants.service';
import { MenuService } from './menu/menu.service';
import { User, UserRole, Country } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DatabaseSeeder implements OnApplicationBootstrap {
  constructor(
    private usersService: UsersService,
    private restaurantsService: RestaurantsService,
    private menuService: MenuService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    // Check if we need to seed the database
    const userCount = await this.userRepository.count();
    
    if (userCount === 0) {
      console.log('Seeding database...');
      await this.seedDatabase();
      console.log('Database seeded successfully!');
    }
  }

  async seedDatabase() {
    try {
      // Seed users
      console.log('Seeding users...');
      await this.usersService.seedUsers();

      // Get admin user for restaurant seeding
      const admin = await this.usersService.findByEmail('nick.fury@shield.com');

      // Seed restaurants
      console.log('Seeding restaurants...');
      await this.restaurantsService.seedRestaurants();

      // Get restaurants for menu seeding
      const restaurants = await this.restaurantsService.findAll(Country.GLOBAL);

      // Seed menu items for each restaurant
      console.log('Seeding menu items...');
      for (const restaurant of restaurants) {
        await this.menuService.seedMenuItems(restaurant.id, Country.GLOBAL);
      }
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }
}
