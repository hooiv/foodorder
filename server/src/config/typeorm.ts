import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import config from './config';

export const getTypeOrmConfig = (
  configService: ConfigType<typeof config>,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.database.host,
    port: configService.database.port,
    username: configService.database.username,
    password: configService.database.password,
    database: configService.database.database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.database.synchronize,
    logging: process.env.NODE_ENV === 'development',
  };
};
