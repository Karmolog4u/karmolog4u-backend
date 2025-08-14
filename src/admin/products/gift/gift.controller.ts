import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from 'src/role/role.enum';
import { Roles } from 'src/role/roles.decorator';
import { DiscountService } from '../discount/discount.service';
import { GiftService } from './gift.service';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/helper/multerOptions';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import { parseFields } from 'src/common/helper/parseFields';
import { fileCompress } from 'src/common/helper/fileCompress';
import {
  coverDeleteFromStorage,
  fileDelete,
} from 'src/common/helper/fileDelete';
import { CreateGiftDto } from './dto/create-gift.dto';
import { GiftEntity } from './dto/gift-entity.dto';
import mongoose from 'mongoose';
import { EditGiftDto } from './dto/edit-gift.dto';
import { ChangeStatusGiftDto } from './dto/change-status-gift.dto';
import { JoiValidationPipe } from 'src/common/pipes/JoiValidationPipe';
import {
  changeStatusGiftSchema,
  newGiftSchema,
  updateGiftSchema,
} from './schemas/gift-validation';
import { getFileNameFromUrl } from 'src/common/helper/getFileNameFromUrl';

@ApiBearerAuth()
@ApiTags('admin-gifts')
@Roles(Role.Admin)
@Controller('admin/products/gifts')
export class GiftController {
  constructor(
    private discountService: DiscountService,
    private giftService: GiftService,
    private readonly configService: ConfigService,
  ) {}
  @Post('create')
  @ApiOperation({
    summary: 'Admin Create Gift',
    description: 'Access restricted to admins',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file with additional fields',
    type: CreateGiftDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'Конфлікт створення подарунку' })
  @UseInterceptors(FileInterceptor('cover', multerOptions()))
  async createGift(
    @Body()
    data: CreateGiftDto,
    @UploadedFile()
    file?: Express.Multer.File,
  ): Promise<ResponseSuccessDto> {
    try {
      const parsedData = parseFields(data);

      //validate data
      const { error } = newGiftSchema.validate(parsedData);
      if (error) {
        throw new BadRequestException(error.details[0].message);
      }
      if (file) {
        const link = await fileCompress(file, this.configService);
        parsedData.cover = link;
      } else if (file) {
        await fileDelete(file.path);
      }

      if (parsedData.hasOwnProperty('discount')) {
        const { discount, ...gift } = parsedData;
        const newGift = await this.giftService.createGift(gift);
        const discountData = {
          ...discount,
          refId: newGift._id,
        };
        await this.discountService.createDiscount(discountData);
        return { message: 'Успішно' };
      } else {
        await this.giftService.createGift(parsedData);
      }
      return { message: 'Успішно' };
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
    summary: 'Admin Get By Id Gift',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'get-gift-by-id',
    type: GiftEntity,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getGiftById(@Param('id') id: string): Promise<GiftEntity> {
    try {
      const giftId = new mongoose.Types.ObjectId(id.toString());
      return await this.giftService.findGiftById(giftId);
    } catch (error) {
      throw new NotFoundException('Гайд не знайдено');
    }
  }

  @Get('get-all')
  @ApiOperation({
    summary: 'Admin Get All gift',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'get-all-gift',
    type: [GiftEntity],
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getAllGift(): Promise<GiftEntity[]> {
    try {
      return await this.giftService.findAllGifts();
    } catch (error) {
      throw new NotFoundException('Гайди не знайдено');
    }
  }

  @Put('edit/:id')
  @ApiOperation({
    summary: 'Admin Edit Gift',
    description: 'Access restricted to admins',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file with additional fields',
    type: EditGiftDto,
  })
  @ApiResponse({
    status: 200,
    description: 'update-Gift',
    type: GiftEntity,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  @UseInterceptors(FileInterceptor('cover', multerOptions()))
  async editGift(
    @Param('id') id: string,
    @Body()
    data: EditGiftDto,
    @UploadedFile()
    file?: Express.Multer.File,
  ): Promise<any> {
    try {
      const parsedData = parseFields(data);
      const { error } = updateGiftSchema.validate(parsedData);
      if (error) {
        throw new BadRequestException(error.details[0].message);
      }
      const giftId = new mongoose.Types.ObjectId(id.toString());

      if (file) {
        const oldGift = await this.giftService.findGiftById(giftId);
        // const parsedUrl = new URL(oldGift.cover);
        // Отримання шляху
        if (oldGift.cover !== '') {
          const filePath = getFileNameFromUrl(oldGift.cover);
          await coverDeleteFromStorage(filePath);
        }
        const link = await fileCompress(file, this.configService);
        parsedData.cover = link;
      } else if (file) {
        await fileDelete(file.path);
      }

      if (parsedData.hasOwnProperty('discount')) {
        const { discount, ...meditation } = parsedData;
        const editedGift = await this.giftService.editGift(meditation, giftId);
        const editedDiscount = await this.discountService.editDiscount({
          ...discount,
          refId: giftId,
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...modifiedDiscount } = editedDiscount.toObject();
        return {
          ...editedGift,
          discount: modifiedDiscount,
        };
      } else {
        await this.discountService.deleteDiscount({
          refId: giftId,
        });
        return await this.giftService.editGift(parsedData, giftId);
      }
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

  @Patch('delete/:id')
  @ApiOperation({
    summary: 'Admin Delete By Id Gift',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'delete-meditation',
    type: GiftEntity,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async deleteGift(@Param('id') id: string): Promise<ResponseSuccessDto> {
    try {
      const giftId = new mongoose.Types.ObjectId(id.toString());
      return await this.giftService.deleteGift(giftId);
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

  @Patch('status/:id')
  @ApiOperation({
    summary: 'Admin Change Status Of Gift',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'change - status -meditation',
    type: ChangeStatusGiftDto,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async changeStatusGift(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(changeStatusGiftSchema))
    status: ChangeStatusGiftDto,
  ): Promise<ResponseSuccessDto> {
    try {
      const giftId = new mongoose.Types.ObjectId(id.toString());
      return await this.giftService.changeStatusGift(giftId, status);
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
