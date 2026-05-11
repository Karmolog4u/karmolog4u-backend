import { Body, Controller, Get, Param, Post, Sse } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-purchase.dto';
import { User } from 'src/common/decorators/user.decorator';
import { UserEntity } from 'src/user/dto/user-entity.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { OptionalAuth } from 'src/common/decorators/optional-auth.decorator';

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

  @Post('education/createSSK')
  @ApiOperation({ summary: 'Create payment for education' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  createSSK(@Body() dto: CreatePaymentDto, @User() user?: UserEntity) {
    return this.service.createCourseSSKPayment(dto, user);
  }

  @Post('education/createCONS_ADV')
  @ApiOperation({ summary: 'Create payment for education' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  createCONS_ADV(@Body() dto: CreatePaymentDto, @User() user?: UserEntity) {
    return this.service.createCONS_ADVPayment(dto, user);
  }

  @Post('callback')
  @ApiOperation({ summary: 'Payment provider callback (WayForPay)' })
  @ApiBody({ type: PaymentCallbackDto })
  @ApiResponse({ status: 200, description: 'Callback processed' })
  callback(@Body() body: PaymentCallbackDto) {
    return this.service.handleCallback(body);
  }

  @Get(':orderReference/status')
  status(@Param('orderReference') orderReference: string) {
    return this.service.getStatus(orderReference);
  }

  @Sse('sse/:orderReference')
  sse(
    @Param('orderReference') orderReference: string,
  ): Observable<MessageEvent> {
    return this.service.sse(orderReference);
  }
}
