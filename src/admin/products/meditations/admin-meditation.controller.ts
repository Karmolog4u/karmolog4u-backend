import {
  BadRequestException,
  NotFoundException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Put,
  UseInterceptors,
  UploadedFile,
  HttpException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JoiValidationPipe } from 'src/common/pipes/JoiValidationPipe';
import { MeditationEntity } from 'src/products/meditations/dto/meditation-entity.dto';
import {
  changeStatusMeditationSchema,
  newMeditationSchema,
  updateMeditationSchema,
} from 'src/admin/products/meditations/schemas/validation.schema';
import { ResponseSuccessDto } from 'src/user/dto/response-success.dto';
import { AdminMeditationService } from './admin-meditation.service';
import { ChangeStatusMeditationDto } from './dto/change-status-meditation.dto';
import { DiscountService } from '../discount/discount.service';
import mongoose from 'mongoose';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ConfigService } from '@nestjs/config';
import { multerOptions } from 'src/common/helper/multerOptions';
import { fileCompress } from 'src/common/helper/fileCompress';
import { parseFields } from 'src/common/helper/parseFields';
import {
  coverDeleteFromStorage,
  fileDelete,
} from 'src/common/helper/fileDelete';
import { CreateMeditationDto } from './dto/create-meditation.dto';
import { EditMeditationDto } from './dto/edit-meditation.dto';
import { getFileNameFromUrl } from 'src/common/helper/getFileNameFromUrl';

@ApiBearerAuth()
@ApiTags('admin-meditations')
@Roles(Role.Admin)
@Controller('admin/products/meditations')
export class AdminMeditationController {
  constructor(
    private discountService: DiscountService,
    private adminMeditationService: AdminMeditationService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create')
  @ApiOperation({
    summary: 'Admin Create Meditation',
    description: 'Access restricted to admins',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file with additional fields',
    type: CreateMeditationDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'Конфлікт створення медитації' })
  @UseInterceptors(FileInterceptor('cover', multerOptions()))
  async createMeditation(
    @Body()
    data: CreateMeditationDto,
    @UploadedFile()
    file?: Express.Multer.File,
  ): Promise<ResponseSuccessDto> {
    try {
      const parsedData = parseFields(data);

      //validate data
      const { error } = newMeditationSchema.validate(parsedData);
      if (error) {
        throw new BadRequestException(error.details[0].message);
      }
      if (file && parsedData.category !== 'ARCANES') {
        const link = await fileCompress(file, this.configService);
        parsedData.cover = link;
      } else if (file) {
        await fileDelete(file.path);
      }

      if (parsedData.hasOwnProperty('discount')) {
        const { discount, ...meditation } = parsedData;
        const newMeditation =
          await this.adminMeditationService.createMeditation(meditation);
        const discountData = {
          ...discount,
          refId: newMeditation._id,
        };
        await this.discountService.createDiscount(discountData);
        return { message: 'Успішно' };
      } else {
        await this.adminMeditationService.createMeditation(parsedData);
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
    summary: 'Admin Get By Id Meditation',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'get-meditation-by-id',
    type: MeditationEntity,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getMeditationById(@Param('id') id: string): Promise<MeditationEntity> {
    try {
      const meditationId = new mongoose.Types.ObjectId(id.toString());
      return await this.adminMeditationService.findMeditationById(meditationId);
    } catch (error) {
      throw new NotFoundException('Медитацію не знайдено');
    }
  }

  @Get('get-all')
  @ApiOperation({
    summary: 'Admin Get All Meditation',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'get-all-meditation',
    type: [MeditationEntity],
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getAllMeditation(): Promise<MeditationEntity[]> {
    try {
      return await this.adminMeditationService.findAllMeditation();
    } catch (error) {
      throw new NotFoundException('Медитації не знайдено');
    }
  }

  @Put('edit/:id')
  @ApiOperation({
    summary: 'Admin Edit Meditation',
    description: 'Access restricted to admins',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file with additional fields',
    type: EditMeditationDto,
  })
  @ApiResponse({
    status: 200,
    description: 'update-meditation',
    type: MeditationEntity,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  @UseInterceptors(FileInterceptor('cover', multerOptions()))
  async editMeditation(
    @Param('id') id: string,
    @Body()
    data: EditMeditationDto,
    @UploadedFile()
    file?: Express.Multer.File,
  ): Promise<any> {
    try {
      const parsedData = parseFields(data);
      const { error } = updateMeditationSchema.validate(parsedData);
      if (error) {
        throw new BadRequestException(error.details[0].message);
      }
      const meditationId = new mongoose.Types.ObjectId(id.toString());

      if (file && parsedData.category !== 'ARCANES') {
        const oldMeditation =
          await this.adminMeditationService.findMeditationById(meditationId);
        // const parsedUrl = new URL(oldMeditation.cover);
        // Отримання шляху
        if (oldMeditation.cover !== '') {
          const filePath = getFileNameFromUrl(oldMeditation.cover); // Видаляємо початковий "/"
          await coverDeleteFromStorage(filePath);
        }
        const link = await fileCompress(file, this.configService);
        parsedData.cover = link;
      } else if (file) {
        await fileDelete(file.path);
      }

      if (parsedData.hasOwnProperty('discount')) {
        const { discount, ...meditation } = parsedData;
        const editedMeditation =
          await this.adminMeditationService.editMeditation(
            meditation,
            meditationId,
          );
        const editedDiscount = await this.discountService.editDiscount({
          ...discount,
          refId: meditationId,
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...modifiedDiscount } = editedDiscount.toObject();
        return {
          ...editedMeditation,
          discount: modifiedDiscount,
        };
      } else {
        await this.discountService.deleteDiscount({
          refId: meditationId,
        });
        return await this.adminMeditationService.editMeditation(
          parsedData,
          meditationId,
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
    summary: 'Admin Delete By Id Meditation',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'delete-meditation',
    type: MeditationEntity,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async deleteMeditation(@Param('id') id: string): Promise<ResponseSuccessDto> {
    try {
      const meditationId = new mongoose.Types.ObjectId(id.toString());
      return await this.adminMeditationService.deleteMeditation(meditationId);
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
    summary: 'Admin Change Status Of Meditation',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'change - status -meditation',
    type: ChangeStatusMeditationDto,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async changeStatusMeditation(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(changeStatusMeditationSchema))
    status: ChangeStatusMeditationDto,
  ): Promise<ResponseSuccessDto> {
    try {
      const meditationId = new mongoose.Types.ObjectId(id.toString());
      return await this.adminMeditationService.changeStatusMeditation(
        meditationId,
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
