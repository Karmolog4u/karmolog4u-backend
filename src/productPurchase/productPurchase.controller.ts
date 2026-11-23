import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { ProductPurchaseService } from './productPurchase.service';
import { Role } from 'src/role/role.enum';
import { Roles } from 'src/role/roles.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { UserEntity } from 'src/user/dto/user-entity.dto';
import { GetAllProductParam } from './dto/get-all-product-param.dto';

@ApiBearerAuth()
@ApiTags('product-purchase')
@Roles(Role.User)
@Controller('/productPurchase')
export class ProductPurchaseController {
  constructor(private productPurchaseService: ProductPurchaseService) {}

  @Get('get-all-products/:type')
  @ApiOperation({
    summary: 'Get User Product',
    description: 'Access restricted to auth users',
  })
  @ApiBadRequestResponse({
    description: 'Не вдалося отримати покупки користувача',
  })
  async getAllCoursePurchase(
    @User() user: UserEntity,
    @Param() param: GetAllProductParam,
  ) {
    try {
      return await this.productPurchaseService.getAllProducts(
        user._id,
        param.type,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Помилка створення покупки');
    }
  }
}
