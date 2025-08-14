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
import { DiscountService } from '../discount/discount.service';
import { AdminWebinarsService } from './admin-webinars.service';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/helper/multerOptions';
import { parseFields } from 'src/common/helper/parseFields';
import { fileCompress } from 'src/common/helper/fileCompress';
import {
  coverDeleteFromStorage,
  fileDelete,
} from 'src/common/helper/fileDelete';
import { WebinarEntity } from './dto/webinar-entity.dto';
import { JoiValidationPipe } from 'src/common/pipes/JoiValidationPipe';
import { ChangeStatusWebinarDto } from './dto/change-status.dto';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import {
  changeStatusWebinarSchema,
  newWebinarSchema,
  updateWebinarSchema,
} from './schemas/webinar-validation';
import mongoose from 'mongoose';
import { CreateWebinarDto } from './dto/create-webinar.dto';
import { EditWebinarDto } from './dto/edit-webinar.dto';
import { getFileNameFromUrl } from 'src/common/helper/getFileNameFromUrl';

@ApiBearerAuth()
@ApiTags('admin-webinars')
@Roles(Role.Admin)
@Controller('admin/products/webinars')
export class AdminWebinarsController {
  constructor(
    private discountService: DiscountService,
    private adminWebinarService: AdminWebinarsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create')
  @ApiOperation({
    summary: 'Admin Create Webinar',
    description: 'Access restricted to admins',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file with additional fields',
    type: CreateWebinarDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'Конфлікт створення вебінару' })
  @UseInterceptors(FileInterceptor('cover', multerOptions()))
  async createWebinar(
    @Body()
    data: CreateWebinarDto,
    @UploadedFile()
    file?: Express.Multer.File,
  ): Promise<ResponseSuccessDto> {
    try {
      const parsedData = parseFields(data);

      //validate data
      const { error } = newWebinarSchema.validate(parsedData);
      if (error) {
        throw new BadRequestException(error.details[0].message);
      }
      if (file && parsedData.category !== 'ETHERS') {
        const link = await fileCompress(file, this.configService);
        parsedData.cover = link;
      } else if (file) {
        await fileDelete(file.path);
      }

      if (parsedData.hasOwnProperty('discount')) {
        const { discount, ...webinar } = parsedData;
        const newWebinar = await this.adminWebinarService.createWebinar(
          webinar,
        );
        const discountData = {
          ...discount,
          refId: newWebinar._id,
        };
        await this.discountService.createDiscount(discountData);
        return { message: 'Успішно' };
      } else {
        await this.adminWebinarService.createWebinar(parsedData);
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
    summary: 'Admin Get By Id Webinar',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'get-webinar-by-id',
    type: WebinarEntity,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getWebinarById(@Param('id') id: string): Promise<WebinarEntity> {
    try {
      const webinarId = new mongoose.Types.ObjectId(id.toString());
      return await this.adminWebinarService.findWebinarById(webinarId);
    } catch (error) {
      throw new NotFoundException('Вебінар не знайдено');
    }
  }

  @Get('get-all')
  @ApiOperation({
    summary: 'Admin Get All Webinar',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'get-all-webinar',
    type: [WebinarEntity],
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getAllWebinar(): Promise<WebinarEntity[]> {
    try {
      return await this.adminWebinarService.findAllWebinar();
    } catch (error) {
      throw new NotFoundException('Вебінари не знайдено');
    }
  }

  @Put('edit/:id')
  @ApiOperation({
    summary: 'Admin Edit Webinar',
    description: 'Access restricted to admins',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file with additional fields',
    type: EditWebinarDto,
  })
  @ApiResponse({
    status: 200,
    description: 'update-webinar',
    type: WebinarEntity,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  @UseInterceptors(FileInterceptor('cover', multerOptions()))
  async editWebinar(
    @Param('id') id: string,
    @Body()
    data: EditWebinarDto,
    @UploadedFile()
    file?: Express.Multer.File,
  ): Promise<any> {
    try {
      const parsedData = parseFields(data);
      const { error } = updateWebinarSchema.validate(parsedData);
      if (error) {
        throw new BadRequestException(error.details[0].message);
      }
      const webinarId = new mongoose.Types.ObjectId(id.toString());

      if (file && parsedData.category !== 'ETHERS') {
        const oldWebinar = await this.adminWebinarService.findWebinarById(
          webinarId,
        );
        if (oldWebinar.cover !== '') {
          const filePath = getFileNameFromUrl(oldWebinar.cover); // Видаляємо початковий "/"
          // Отримання шляху
          await coverDeleteFromStorage(filePath);
        }
        const link = await fileCompress(file, this.configService);
        parsedData.cover = link;
      } else if (file) {
        await fileDelete(file.path);
      }

      if (parsedData.hasOwnProperty('discount')) {
        const { discount, ...webinar } = parsedData;
        const editedWebinar = await this.adminWebinarService.editWebinar(
          webinar,
          webinarId,
        );
        const editedDiscount = await this.discountService.editDiscount({
          ...discount,
          refId: webinarId,
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...modifiedDiscount } = editedDiscount.toObject();
        return {
          ...editedWebinar,
          discount: modifiedDiscount,
        };
      } else {
        await this.discountService.deleteDiscount({
          refId: webinarId,
        });
        return await this.adminWebinarService.editWebinar(
          parsedData,
          webinarId,
        );
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
    summary: 'Admin Delete By Id Webinar',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'delete-webinar',
    type: WebinarEntity,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async deleteWebinar(@Param('id') id: string): Promise<ResponseSuccessDto> {
    try {
      const webinarId = new mongoose.Types.ObjectId(id.toString());
      return await this.adminWebinarService.deleteWebinar(webinarId);
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
    summary: 'Admin Change Status Of Webinar',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'change-status-webinar',
    type: ChangeStatusWebinarDto,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async changeStatusWebinar(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(changeStatusWebinarSchema))
    status: ChangeStatusWebinarDto,
  ): Promise<ResponseSuccessDto> {
    try {
      const webinarId = new mongoose.Types.ObjectId(id.toString());
      return await this.adminWebinarService.changeStatusWebinar(
        webinarId,
        status,
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
