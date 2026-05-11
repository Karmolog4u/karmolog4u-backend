import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/role.enum';
import { ProductPurchaseService } from './productPurchase.service';
import { AddProductsDto } from './dto/add-product-purchase.dto';
import { UserIdParamDto } from './dto/user-id-params.dto';
import { DeletePurchaseDto } from './dto/delete-product-purchase.dto';

@ApiBearerAuth()
@ApiTags('admin-product-purchase')
@Roles(Role.Admin)
@Controller('admin/productPurchase')
export class ProductPurchaseController {
  constructor(private productPurchaseService: ProductPurchaseService) {}

  @Post('add/:userId')
  @ApiOperation({
    summary: 'Admin Add Products To User',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    description: 'Upload fields',
    type: AddProductsDto,
  })
  @ApiBadRequestResponse({
    description: 'Виникла помилка(',
  })
  async createCourse(
    @Body()
    data: AddProductsDto,
    @Param() params: UserIdParamDto,
  ) {
    try {
      return await this.productPurchaseService.addProductPurchases(
        params.userId,
        data,
      );
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

  @Get('get/:userId')
  @ApiOperation({
    summary: 'Admin Get User Product Purchase',
    description: 'Access restricted to admins',
  })
  @ApiBadRequestResponse({
    description: 'Не вдалося отримати покупки користувача',
  })
  async getUserPurchase(@Param() param: UserIdParamDto) {
    try {
      return await this.productPurchaseService.getUserPurchase(param.userId);
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

  @Get('get-all')
  @ApiOperation({
    summary: 'Admin Get All Product Purchase',
    description: 'Access restricted to admins',
  })
  @ApiBadRequestResponse({
    description: 'Не вдалося отримати покупки користувача',
  })
  async getAllProductPurchase(@Param() param: UserIdParamDto) {
    try {
      return await this.productPurchaseService.getUserPurchase(param.userId);
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

  @Delete('delete/:purchaseId')
  @ApiOperation({
    summary: 'Admin Delete Product Purchase',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    description: 'Upload fields',
    type: DeletePurchaseDto,
  })
  @ApiBadRequestResponse({
    description: 'Не вдалося отримати покупки користувача',
  })
  async deleteProductPurchase(@Param() param: DeletePurchaseDto) {
    try {
      return await this.productPurchaseService.deletePurchase(param.purchaseId);
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
