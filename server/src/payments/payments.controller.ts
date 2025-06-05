import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get a user payment method' })
  getUserPaymentMethod(
    @Param('userId') userId: string,
    @Request() req
  ) {
    return this.paymentsService.getUserPaymentMethod(
      userId,
      req.user.userId,
      req.user.role
    );
  }

  @Post(':userId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a user payment method (Admin only)' })
  updateUserPaymentMethod(
    @Param('userId') userId: string,
    @Body() paymentData: { paymentMethod: string },
    @Request() req
  ) {
    return this.paymentsService.updateUserPaymentMethod(
      userId,
      paymentData.paymentMethod,
      req.user.userId,
      req.user.role
    );
  }

  @Post('process')
  @ApiOperation({ summary: 'Process a payment' })
  processPayment(@Body() paymentData: any) {
    return this.paymentsService.processPayment(paymentData);
  }
}
