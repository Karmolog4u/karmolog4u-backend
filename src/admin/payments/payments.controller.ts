import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminPaymentServices } from './payments.service';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/role.enum';

@ApiBearerAuth()
@ApiTags('admin-payments')
@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly adminPaymentService: AdminPaymentServices) {}
  @Get('get/:id')
  async getAllPayments(@Param('id') id: string) {
    return await this.adminPaymentService.getAllPayments(id);
  }
  @Roles(Role.Admin)
  @Patch('decline/:id')
  async declinePayment(@Param('id') id: string) {
    return this.adminPaymentService.declinePayment(id);
  }
}
