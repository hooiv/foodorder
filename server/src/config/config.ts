import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {    database: {
      type: process.env.DATABASE_TYPE || 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'foodorder',
      synchronize: process.env.DATABASE_SYNC === 'true',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
  };
});
