import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import config from './config/config';
import { validationSchema } from './config/validation';
import { getTypeOrmConfig } from './config/typeorm';
import { DatabaseSeeder } from './database.seeder';
import { User } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],      useFactory: (configService: ConfigService) => {
        // Use non-null assertion to handle potential undefined
        return getTypeOrmConfig(configService.get('config')!);
      },
    }),
    TypeOrmModule.forFeature([User]), // Add this for the database seeder
    UsersModule,
    AuthModule,
    RestaurantsModule,
    MenuModule,
    OrdersModule,
    PaymentsModule,
  ],  controllers: [AppController],
  providers: [AppService, DatabaseSeeder],
})
export class AppModule {}
