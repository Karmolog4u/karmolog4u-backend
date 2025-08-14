import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PromoCodeService } from './promo-code.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/role.enum';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import { JoiValidationPipe } from 'src/common/pipes/JoiValidationPipe';
import {
  createPromoCodeSchema,
  DeletePromoCodesValidationSchema,
  editPromoCodeSchema,
} from './schemas/promo-code-validation';
import mongoose from 'mongoose';
import { EditPromoCodeDto } from './dto/edit-promo-code.dto';

@ApiBearerAuth()
@ApiTags('admin-promo-code')
@Roles(Role.Admin)
@Controller('admin/promo-code')
export class PromoCodeController {
  constructor(private promoCodeService: PromoCodeService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Admin Create PromoCode',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    // description: 'Upload a file with additional fields',
    type: CreatePromoCodeDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'Конфлікт створення промокоду' })
  async createPromoCode(
    @Body(new JoiValidationPipe(createPromoCodeSchema))
    data: CreatePromoCodeDto,
  ) {
    try {
      return await this.promoCodeService.createPromoCode(data);
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

  @Put('edit/:id')
  @ApiOperation({
    summary: 'Admin Edit PromoCode',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    // description: 'Upload a file with additional fields',
    type: EditPromoCodeDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'Конфлікт створення промокоду' })
  async editPromoCode(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(editPromoCodeSchema))
    data: EditPromoCodeDto,
  ) {
    try {
      const promoCodeId = new mongoose.Types.ObjectId(id.toString());
      return await this.promoCodeService.editPromoCode(data, promoCodeId);
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

  @Delete('delete')
  @ApiOperation({
    summary: 'Admin Delete PromoCodes',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    // description: 'Upload a file with additional fields',
    type: [String],
    // isArray: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Успішно',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'Конфлікт видалення промокодів' })
  async deletePromoCodes(
    @Body(new JoiValidationPipe(DeletePromoCodesValidationSchema))
    data: string[],
  ): Promise<ResponseSuccessDto> {
    try {
      const promoCodeIDs = data.map(
        (id) => new mongoose.Types.ObjectId(id.toString()),
      );
      return await this.promoCodeService.deletePromoCodes(promoCodeIDs);
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

  @Get('get/:id')
  @ApiOperation({
    summary: 'Admin Get By Id PromoCode',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
    // type: any,
  })
  async findPromoCodeById(@Param('id') id: string) {
    try {
      const promoCodeId = new mongoose.Types.ObjectId(id.toString());
      return await this.promoCodeService.findPromoCodeById(promoCodeId);
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

  @Get('get')
  @ApiOperation({
    summary: 'Admin Get All PromoCode',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
    // type: ResponseSuccessDto,
  })
  async findAllPromoCode(@Query() paginationDto) {
    try {
      return await this.promoCodeService.findAllPromoCode(
        paginationDto.searchQuery,
        +paginationDto.page,
        +paginationDto.limit,
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

  @Patch('block/:id')
  @ApiOperation({
    summary: 'Admin Block PromoCode',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
    type: ResponseSuccessDto,
  })
  async blockPromoCode(@Param('id') id: string) {
    try {
      const promoCodeId = new mongoose.Types.ObjectId(id.toString());
      return await this.promoCodeService.blockPromoCode(promoCodeId);
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

  @Get('get-product')
  @ApiOperation({
    summary: 'Admin Get All PromoCode',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
    type: ResponseSuccessDto,
  })
  async getProduct(@Query() paginationDto) {
    try {
      return await this.promoCodeService.getAllProductsPromoCode(
        paginationDto.searchQuery,
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
}
