import { GuidesAndBooksEntity } from './dto/guides_and_books-entity.dto';
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
import mongoose from 'mongoose';
import { JoiValidationPipe } from 'src/common/pipes/JoiValidationPipe';
import { Role } from 'src/role/role.enum';
import { Roles } from 'src/role/roles.decorator';
import { DiscountService } from '../discount/discount.service';
import { AdminGuidesAndBooksService } from './admin-guides_and_books.service';
import { ConfigService } from '@nestjs/config';
import { CreateGuidesAndBooksDto } from './dto/create-guides_and_books.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/helper/multerOptions';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import { parseFields } from 'src/common/helper/parseFields';
import { fileCompress } from 'src/common/helper/fileCompress';
import {
  coverDeleteFromStorage,
  fileDelete,
} from 'src/common/helper/fileDelete';
import { EditGuidesAndBooksDto } from './dto/edit-guides_and_books.dto';
import { ChangeStatusGuidesAndBooksDto } from './dto/change-status-guides_and_books.dto';
import {
  changeStatusGuidesAndBooksSchema,
  newGuidesAndBooksSchema,
  updateGuidesAndBooksSchema,
} from './schemas/guides_and_books-validation';
import { getFileNameFromUrl } from 'src/common/helper/getFileNameFromUrl';

@ApiBearerAuth()
@ApiTags('admin-guides-and-books')
@Roles(Role.Admin)
@Controller('admin/products/guides-and-books')
export class AdminGuidesAndBooksController {
  constructor(
    private discountService: DiscountService,
    private adminGuidesAndBooksService: AdminGuidesAndBooksService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create')
  @ApiOperation({
    summary: 'Admin Create GuidesAndBooks',
    description: 'Access restricted to admins',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file with additional fields',
    type: CreateGuidesAndBooksDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'Конфлікт створення гайдів' })
  @UseInterceptors(FileInterceptor('cover', multerOptions()))
  async createGuidesAndBooks(
    @Body()
    data: CreateGuidesAndBooksDto,
    @UploadedFile()
    file?: Express.Multer.File,
  ): Promise<ResponseSuccessDto> {
    try {
      const parsedData = parseFields(data);

      //validate data
      const { error } = newGuidesAndBooksSchema.validate(parsedData);
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
        const { discount, ...guidesAndBooks } = parsedData;
        const newGuidesAndBooks =
          await this.adminGuidesAndBooksService.createGuidesAndBooks(
            guidesAndBooks,
          );
        const discountData = {
          ...discount,
          refId: newGuidesAndBooks._id,
        };
        await this.discountService.createDiscount(discountData);
        return { message: 'Успішно' };
      } else {
        await this.adminGuidesAndBooksService.createGuidesAndBooks(parsedData);
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
    summary: 'Admin Get By Id GuidesAndBooks',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'get-guidesAndBooks-by-id',
    type: GuidesAndBooksEntity,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getGuidesAndBooksById(
    @Param('id') id: string,
  ): Promise<GuidesAndBooksEntity> {
    try {
      const guidesAndBooksId = new mongoose.Types.ObjectId(id.toString());
      return await this.adminGuidesAndBooksService.findGuidesAndBooksById(
        guidesAndBooksId,
      );
    } catch (error) {
      throw new NotFoundException('Гайд не знайдено');
    }
  }

  @Get('get-all')
  @ApiOperation({
    summary: 'Admin Get All GuidesAndBooks',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'get-all-guidesAndBooks',
    type: [GuidesAndBooksEntity],
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getAllGuidesAndBooks(): Promise<GuidesAndBooksEntity[]> {
    try {
      return await this.adminGuidesAndBooksService.findAllGuidesAndBooks();
    } catch (error) {
      throw new NotFoundException('Гайди не знайдено');
    }
  }

  @Put('edit/:id')
  @ApiOperation({
    summary: 'Admin Edit GuidesAndBooks',
    description: 'Access restricted to admins',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file with additional fields',
    type: EditGuidesAndBooksDto,
  })
  @ApiResponse({
    status: 200,
    description: 'update-GuidesAndBooks',
    type: GuidesAndBooksEntity,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  @UseInterceptors(FileInterceptor('cover', multerOptions()))
  async editGuidesAndBooks(
    @Param('id') id: string,
    @Body()
    data: EditGuidesAndBooksDto,
    @UploadedFile()
    file?: Express.Multer.File,
  ): Promise<any> {
    try {
      const parsedData = parseFields(data);
      const { error } = updateGuidesAndBooksSchema.validate(parsedData);
      if (error) {
        throw new BadRequestException(error.details[0].message);
      }
      const guidesAndBooksId = new mongoose.Types.ObjectId(id.toString());

      if (file && parsedData.category !== 'ARCANES') {
        const oldGuidesAndBooks =
          await this.adminGuidesAndBooksService.findGuidesAndBooksById(
            guidesAndBooksId,
          );
        if (oldGuidesAndBooks.cover !== '') {
          // const parsedUrl = new URL(oldGuidesAndBooks.cover);
          const filePath = getFileNameFromUrl(oldGuidesAndBooks.cover);
          // Отримання шляху // Видаляємо початковий "/"
          await coverDeleteFromStorage(filePath);
        }
        const link = await fileCompress(file, this.configService);
        parsedData.cover = link;
      } else if (file) {
        await fileDelete(file.path);
      }

      if (parsedData.hasOwnProperty('discount')) {
        const { discount, ...meditation } = parsedData;
        const editedGuidesAndBooks =
          await this.adminGuidesAndBooksService.editGuidesAndBooks(
            meditation,
            guidesAndBooksId,
          );
        const editedDiscount = await this.discountService.editDiscount({
          ...discount,
          refId: guidesAndBooksId,
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...modifiedDiscount } = editedDiscount.toObject();
        return {
          ...editedGuidesAndBooks,
          discount: modifiedDiscount,
        };
      } else {
        await this.discountService.deleteDiscount({
          refId: guidesAndBooksId,
        });
        return await this.adminGuidesAndBooksService.editGuidesAndBooks(
          parsedData,
          guidesAndBooksId,
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
    summary: 'Admin Delete By Id GuidesAndBooks',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'delete-meditation',
    type: GuidesAndBooksEntity,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async deleteGuidesAndBooks(
    @Param('id') id: string,
  ): Promise<ResponseSuccessDto> {
    try {
      const guidesAndBooksId = new mongoose.Types.ObjectId(id.toString());
      return await this.adminGuidesAndBooksService.deleteGuidesAndBooks(
        guidesAndBooksId,
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

  @Patch('status/:id')
  @ApiOperation({
    summary: 'Admin Change Status Of GuidesAndBooks',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'change - status -meditation',
    type: ChangeStatusGuidesAndBooksDto,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async changeStatusGuidesAndBooks(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(changeStatusGuidesAndBooksSchema))
    status: ChangeStatusGuidesAndBooksDto,
  ): Promise<ResponseSuccessDto> {
    try {
      const meditationId = new mongoose.Types.ObjectId(id.toString());
      return await this.adminGuidesAndBooksService.changeStatusGuidesAndBooks(
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
