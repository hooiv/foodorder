import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, Country } from '../entities/user.entity';
import { COUNTRIES_KEY } from './countries.decorator';

@Injectable()
export class CountryGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const countryConfig = this.reflector.getAllAndOverride<any>(COUNTRIES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!countryConfig) {
      return true; // No country restriction specified
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }
    
    // Admin can access everything regardless of country
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Users with GLOBAL country can access everything
    if (user.country === Country.GLOBAL) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const resourceCountry = this.getResourceCountry(request);
    
    // If no country is specified in the resource, allow access
    if (!resourceCountry) {
      return true;
    }
    
    // For exact match, the user's country must match the resource country
    if (countryConfig.requireExactMatch) {
      return user.country === resourceCountry;
    }
    
    // Otherwise, allow access to global resources
    return resourceCountry === Country.GLOBAL || user.country === resourceCountry;
  }

  private getResourceCountry(request: any): Country | null {
    // Try to extract country from request parameters, body, or query
    const resourceId = 
      request.params?.id || 
      (request.body?.id) || 
      request.query?.id;

    if (!resourceId) {
      return null;
    }
    
    // This is a placeholder - in a real application, you would look up the country
    // of the resource based on the resource ID in your database
    // For now, we'll just return null, which means no country restriction
    return null;
  }
}
