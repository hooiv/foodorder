import { SetMetadata } from '@nestjs/common';

export const COUNTRIES_KEY = 'countries';
export const RequireCountry = (requireExactMatch: boolean = true) => 
  SetMetadata(COUNTRIES_KEY, { requireExactMatch });
