import { Controller, Get, HttpException, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from 'src/role/role.enum';
import { Roles } from 'src/role/roles.decorator';
import { ProductService } from './product.service';
import { ProductIdParamDto } from './dto/get-product-detail.dto';
import { User } from 'src/common/decorators/user.decorator';
import { UserEntity } from 'src/user/dto/user-entity.dto';

@ApiBearerAuth()
@ApiTags('product')
@Roles(Role.User)
@Controller('/product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('get-details-product/:productId')
  @ApiOperation({
    summary: 'Get User Product',
    description: 'Access restricted to auth users',
  })
  @ApiBadRequestResponse({
    description: 'Не вдалося отримати покупки користувача',
  })
  async getDetailProduct(@Param() param: ProductIdParamDto) {
    try {
      return await this.productService.getProductDetails(param.productId);
    } catch (error) {
      throw new HttpException(
        {
          status: error.status,
          message: error.response.message,
          error: error.response.error,
        },
        error.status,
        {
          cause: error,
        },
      );
    }
  }

  @Get('get-interesting-products')
  @ApiOperation({
    summary: 'Get User Product',
    description: 'Access restricted to auth users',
  })
  @ApiBadRequestResponse({
    description: 'Не вдалося отримати покупки користувача',
  })
  async getInterestingProduct(@User() user: UserEntity) {
    try {
      return await this.productService.getAllProductsWithPrice(user._id);
    } catch (error) {
      throw new HttpException(
        {
          status: error.status,
          message: error.response.message,
          error: error.response.error,
        },
        error.status,
        {
          cause: error,
        },
      );
    }
  }
}
