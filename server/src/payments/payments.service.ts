import { Injectable, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class PaymentsService {
  constructor(private usersService: UsersService) {}

  async getUserPaymentMethod(userId: string, requestingUserId: string, requestingUserRole: UserRole) {
    // Check if the requesting user has permission to view the payment method
    if (userId !== requestingUserId && requestingUserRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to access this payment method');
    }

    const user = await this.usersService.findOne(userId);
    return { paymentMethod: user.paymentMethod };
  }

  async updateUserPaymentMethod(
    userId: string, 
    paymentMethod: string, 
    requestingUserId: string, 
    requestingUserRole: UserRole
  ) {
    // Only Admin can update payment methods
    if (requestingUserRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can update payment methods');
    }
    
    const updatedUser = await this.usersService.updatePaymentMethod(
      userId,
      paymentMethod,
      requestingUserRole
    );
    
    return { success: true, paymentMethod: updatedUser.paymentMethod };
  }

  // This would be expanded to handle actual payment processing in a real app
  async processPayment(paymentData: any) {
    // In a real application, this would integrate with a payment gateway
    // For now, we'll just simulate a successful payment
    const paymentId = `payment_${Date.now()}`;
    
    return { 
      success: true, 
      paymentId,
      message: 'Payment processed successfully'
    };
  }
}
