import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../entities/menu-item.entity';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { Country } from '../entities/restaurant.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    private restaurantsService: RestaurantsService,
  ) {}

  async findAllByRestaurant(restaurantId: string, userCountry: Country): Promise<MenuItem[]> {
    // First, check if user has access to the restaurant
    await this.restaurantsService.findOne(restaurantId, userCountry);
    
    return this.menuItemRepository.find({
      where: { restaurant: { id: restaurantId } },
      relations: ['restaurant'],
    });
  }
  async findOne(id: string, userCountry: Country): Promise<MenuItem> {
    if (!id) {
      throw new NotFoundException('Menu item ID is required');
    }

    try {
      const menuItem = await this.menuItemRepository.findOne({
        where: { id },
        relations: ['restaurant'],
      });
      
      if (!menuItem) {
        throw new NotFoundException(`Menu item with ID ${id} not found`);
      }
      
      // Check if user has access to this restaurant
      if (menuItem.restaurant && menuItem.restaurant.id) {
        await this.restaurantsService.findOne(menuItem.restaurant.id, userCountry);
      } else {
        throw new NotFoundException(`Restaurant not found for menu item with ID ${id}`);
      }
      
      return menuItem;
    } catch (error) {
      console.error(`Error finding menu item with ID ${id}:`, error);
      if (error.status === 404) {
        throw error;
      }
      throw new Error(`Failed to retrieve menu item: ${error.message}`);
    }
  }
  async create(createMenuItemDto: any, userCountry: Country): Promise<MenuItem> {
    const { restaurantId, ...menuItemData } = createMenuItemDto;
    
    // Check if user has access to this restaurant
    const restaurant = await this.restaurantsService.findOne(restaurantId, userCountry);
      const menuItem = this.menuItemRepository.create({
      ...menuItemData,
      restaurant,
    });    const savedItem = await this.menuItemRepository.save(menuItem);
    return savedItem as unknown as MenuItem;
  }

  async update(
    id: string, 
    updateMenuItemDto: any, 
    userCountry: Country,
  ): Promise<MenuItem> {
    const menuItem = await this.findOne(id, userCountry);
    
    Object.assign(menuItem, updateMenuItemDto);
    
    return this.menuItemRepository.save(menuItem);
  }

  async remove(id: string, userCountry: Country): Promise<void> {
    const menuItem = await this.findOne(id, userCountry);
    await this.menuItemRepository.remove(menuItem);
  }
  async seedMenuItems(restaurantId: string, userCountry: Country): Promise<void> {
    // First, check if user has access to the restaurant
    const restaurant = await this.restaurantsService.findOne(restaurantId, userCountry);

    // Define the type for menu items
    interface MenuItemData {
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      categories: string[];
      isAvailable: boolean;
    }

    let menuItems: MenuItemData[] = [];
      if (restaurant.country === Country.INDIA) {
      menuItems = [
        {
          name: 'Butter Chicken',
          description: 'Tender chicken in a rich buttery tomato sauce',
          price: 14.99,
          imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center',
          categories: ['Main Course', 'Chicken', 'Spicy'],
          isAvailable: true,
        },        {
          name: 'Vegetable Biryani',
          description: 'Fragrant basmati rice with mixed vegetables and spices',
          price: 12.99,
          imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop&crop=center',
          categories: ['Main Course', 'Rice', 'Vegetarian'],
          isAvailable: true,
        },        {
          name: 'Garlic Naan',
          description: 'Soft flatbread with garlic and butter',
          price: 3.99,
          imageUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop&crop=center',
          categories: ['Bread', 'Side Dish'],
          isAvailable: true,
        },
      ];    } else if (restaurant.country === Country.AMERICA) {
      menuItems = [
        {
          name: 'Cheeseburger',
          description: 'Juicy beef patty with cheese, lettuce, and tomato',
          price: 9.99,
          imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&crop=center',
          categories: ['Burgers', 'Main Course'],
          isAvailable: true,
        },
        {
          name: 'Buffalo Wings',
          description: 'Spicy chicken wings with blue cheese dip',
          price: 11.99,
          imageUrl: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=300&fit=crop&crop=center',
          categories: ['Appetizer', 'Chicken', 'Spicy'],
          isAvailable: true,
        },
        {
          name: 'Caesar Salad',
          description: 'Fresh romaine lettuce with Caesar dressing and croutons',
          price: 8.99,
          imageUrl: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop&crop=center',
          categories: ['Salad', 'Healthy'],
          isAvailable: true,
        },
      ];    } else {
      menuItems = [        {
          name: 'World Pizza',
          description: 'Pizza with international toppings',
          price: 15.99,
          imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&crop=center',
          categories: ['Pizza', 'Main Course'],
          isAvailable: true,
        },
        {
          name: 'Global Salad',
          description: 'Mixed greens with ingredients from around the world',
          price: 9.99,
          imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop&crop=center',
          categories: ['Salad', 'Healthy', 'Vegetarian'],
          isAvailable: true,
        },
        {
          name: 'International Platter',
          description: 'Sample dishes from different cuisines',
          price: 19.99,
          imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&crop=center',
          categories: ['Main Course', 'Sharing'],
          isAvailable: true,
        },
      ];}
      for (const itemData of menuItems) {
      const existingItem = await this.menuItemRepository.findOne({ 
        where: { 
          name: itemData.name,
          restaurant: { id: restaurant.id } 
        },
        relations: ['restaurant'],
      });
      
      if (!existingItem) {
        // Create menu item with proper typing
        const menuItem = this.menuItemRepository.create({          name: itemData.name,
          description: itemData.description,
          price: itemData.price,
          imageUrl: itemData.imageUrl,
          isAvailable: itemData.isAvailable,
          categories: itemData.categories,
          restaurant,
        });
        await this.menuItemRepository.save(menuItem);
      } else {
        // Update existing menu item with new image URL
        existingItem.imageUrl = itemData.imageUrl;
        await this.menuItemRepository.save(existingItem);
      }
    }
  }
}
