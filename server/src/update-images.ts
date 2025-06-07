import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RestaurantsService } from './restaurants/restaurants.service';
import { MenuService } from './menu/menu.service';
import { Country } from './entities/user.entity';

async function updateImages() {
  console.log('Starting image update...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const restaurantsService = app.get(RestaurantsService);
  const menuService = app.get(MenuService);

  try {
    // Update restaurants with new images
    console.log('Updating restaurant images...');
    await restaurantsService.seedRestaurants();

    // Get restaurants for menu seeding
    const restaurants = await restaurantsService.findAll(Country.GLOBAL);

    // Update menu items with new images
    console.log('Updating menu item images...');
    for (const restaurant of restaurants) {
      await menuService.seedMenuItems(restaurant.id, Country.GLOBAL);
    }

    console.log('Images updated successfully!');
  } catch (error) {
    console.error('Error updating images:', error);
  } finally {
    await app.close();
  }
}

updateImages();
