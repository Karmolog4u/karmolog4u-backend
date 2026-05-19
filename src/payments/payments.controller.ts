import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-purchase.dto';
import { User } from 'src/common/decorators/user.decorator';
import { UserEntity } from 'src/user/dto/user-entity.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { OptionalAuth } from 'src/common/decorators/optional-auth.decorator';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/role.enum';
import { Public } from 'src/common/decorators/isPublic.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @OptionalAuth()
  @Post('product/create')
  @ApiOperation({ summary: 'Create payment for product' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  create(@Body() body: CreatePaymentDto, @User() user?: UserEntity) {
    return this.service.createPayment(body, user);
  }

  @Roles(Role.User)
  @ApiBearerAuth()
  @Post('education/create/:id')
  @ApiOperation({ summary: 'Create payment for education' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  createSSK(@Param('id') id: string, @User() user?: UserEntity) {
    return this.service.createCoursePayment(id, user);
  }

  @Public()
  @Post('products/callback')
  @ApiOperation({ summary: 'Payment provider callback (WayForPay)' })
  @ApiBody({ type: PaymentCallbackDto })
  @ApiResponse({ status: 200, description: 'Callback processed' })
  async callback(@Body() body: PaymentCallbackDto) {
    const payload =
      typeof Object.keys(body)[0] === 'string'
        ? JSON.parse(Object.keys(body)[0])
        : body;
    return this.service.handleProductCallback(payload);
  }
}
