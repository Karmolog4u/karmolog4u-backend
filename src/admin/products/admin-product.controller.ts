import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminMeditationService } from './meditations/admin-meditation.service';
import { AdminGuidesAndBooksService } from './guides_and_books/admin-guides_and_books.service';
import { AdminWebinarsService } from './webinars/admin-webinars.service';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/role.enum';
import { GiftService } from './gift/gift.service';
import { ProductListResponseDto } from './dto/get-product-list-response.dto';

@ApiBearerAuth()
@ApiTags('admin-product')
@Roles(Role.Admin)
@Controller('admin/products')
export class AdminProductController {
  constructor(
    private adminMeditationService: AdminMeditationService,
    private adminWebinarService: AdminWebinarsService,
    private adminGuidesAndBooksService: AdminGuidesAndBooksService,
    private giftService: GiftService,
  ) {}

  @Get('product-count')
  @ApiOperation({ summary: 'Get count of each product' })
  @ApiResponse({
    status: 200,
    description: 'get count of product ',
    type: Number,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getProductCount(): Promise<any> {
    try {
      const meditations =
        await this.adminMeditationService.getMeditationCount();
      const webinars = await this.adminWebinarService.getWebinarCount();
      const guidesAndBooks =
        await this.adminGuidesAndBooksService.getGuidesAndBooksCount();
      const gifts = await this.giftService.getGiftsCount();
      return {
        meditations,
        webinars,
        'guides-and-books': guidesAndBooks,
        gifts,
      };
    } catch (error) {
      throw new BadRequestException('Something wrong');
    }
  }

  @Get('list')
  @ApiOperation({ summary: 'Get list of products' })
  @ApiResponse({
    status: 200,
    description: 'get list of product ',
    type: ProductListResponseDto,
  })
  @ApiInternalServerErrorResponse({ description: 'Не вдалося отримати список' })
  async getProductList(): Promise<ProductListResponseDto> {
    try {
      const meditations = await this.adminMeditationService.getMeditationList();
      const webinars = await this.adminWebinarService.getWebinarList();
      const guidesAndBooks =
        await this.adminGuidesAndBooksService.getGuidesAndBooksList();
      return {
        list: [...meditations, ...webinars, ...guidesAndBooks],
      };
    } catch (error) {
      throw new HttpException(
        {
          status: error.status,
          message: error.response.message,
        },
        error.status,
        {
          cause: error,
        },
      );
    }
  }
}
