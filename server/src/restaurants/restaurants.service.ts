import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant, Country } from '../entities/restaurant.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
  ) {}

  async findAll(userCountry: Country): Promise<Restaurant[]> {
    // Admin or Global country user can see all restaurants
    if (userCountry === Country.GLOBAL) {
      return this.restaurantsRepository.find();
    }
    
    // Otherwise, filter by restaurants from user's country or global restaurants
    return this.restaurantsRepository.find({
      where: [{ country: userCountry }, { country: Country.GLOBAL }],
    });
  }

  async findOne(id: string, userCountry: Country): Promise<Restaurant> {
    const restaurant = await this.restaurantsRepository.findOne({ 
      where: { id },
      relations: ['menuItems'],
    });
    
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    
    // Check country access
    if (
      userCountry !== Country.GLOBAL && 
      restaurant.country !== Country.GLOBAL && 
      restaurant.country !== userCountry
    ) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    
    return restaurant;
  }  async create(createRestaurantDto: any): Promise<Restaurant> {
    const restaurant = this.restaurantsRepository.create(createRestaurantDto);
    const result = await this.restaurantsRepository.save(restaurant);
    return result as unknown as Restaurant;
  }

  async update(id: string, updateRestaurantDto: any, userCountry: Country): Promise<Restaurant> {
    const restaurant = await this.findOne(id, userCountry);
    Object.assign(restaurant, updateRestaurantDto);
    return this.restaurantsRepository.save(restaurant);
  }

  async remove(id: string, userCountry: Country): Promise<void> {
    const restaurant = await this.findOne(id, userCountry);
    await this.restaurantsRepository.remove(restaurant);
  }

  async seedRestaurants(): Promise<void> {    const restaurants = [
      {
        name: 'Indian Spice House',
        description: 'Authentic Indian cuisine with a modern twist',
        address: 'Mumbai Central, Mumbai, India',
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=400&fit=crop&crop=center',
        country: Country.INDIA,
      },
      {
        name: 'Curry Palace',
        description: 'Serving delicious curry dishes from all regions of India',
        address: 'Gandhi Street, Delhi, India',
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=400&fit=crop&crop=center',
        country: Country.INDIA,
      },
      {
        name: 'American Diner',
        description: 'Classic American comfort food',
        address: '5th Avenue, New York, USA',
        imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=400&fit=crop&crop=center',
        country: Country.AMERICA,
      },
      {
        name: 'Burger Joint',
        description: 'Best burgers in town',
        address: 'Broadway, Los Angeles, USA',
        imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=400&fit=crop&crop=center',
        country: Country.AMERICA,
      },
      {
        name: 'Global Eats',
        description: 'International cuisine from around the world',
        address: 'World Trade Center, New York, USA',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop&crop=center',
        country: Country.GLOBAL,
      },
    ];    for (const restaurantData of restaurants) {
      const existingRestaurant = await this.restaurantsRepository.findOne({ 
        where: { name: restaurantData.name } 
      });
      
      if (!existingRestaurant) {
        const restaurant = this.restaurantsRepository.create(restaurantData);
        await this.restaurantsRepository.save(restaurant);
      } else {
        // Update existing restaurant with new image URL
        existingRestaurant.imageUrl = restaurantData.imageUrl;
        await this.restaurantsRepository.save(existingRestaurant);
      }
    }
  }
}
