import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import {
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
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
import { Public } from 'src/common/decorators/isPublic.decorator';
import { Role } from 'src/role/role.enum';
import { Roles } from 'src/role/roles.decorator';
import { StorageService } from './storage.service';
import { DownloadImageParamsDto } from './dto/download-image-params.dto';
import { UploadCoverResponseDto } from './dto/upload-cover-response.dto';

import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UploadFilesDto } from './dto/upload-files.dto';
import {
  multerOptions,
  multerOptionsFiles,
} from 'src/common/helper/multerOptions';
import { TemporaryImageParamsDto } from './dto/temporary-image-params.dto';
import { TemporaryFileParamsDto } from './dto/temporary-file-params.dto';
import { DownloadFileParamsDto } from './dto/dowload-file-param.dto';

@ApiTags('storage')
@Controller('')
export class StorageController {
  constructor(
    private storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  @ApiBearerAuth()
  @Roles(Role.User, Role.Admin)
  @Post('uploadCover')
  @ApiOperation({
    summary: 'Admin Upload Cover',
    description: 'Access restricted to admins',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Cover upload',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
    type: UploadCoverResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Конфлікт завантаження зображення ',
  })
  @UseInterceptors(FileInterceptor('image', multerOptions()))
  async uploadImage(
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<UploadCoverResponseDto> {
    try {
      const envValue = this.configService.get<string>('SERVER_IP');
      const coverPath = this.storageService.getPathTempCover(file.filename);
      return { link: `${envValue}${coverPath}` };
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

  @ApiBearerAuth()
  @Roles(Role.User, Role.Admin)
  @Post('uploadFiles')
  @ApiOperation({
    summary: 'Admin Upload Files',
    description: 'Access restricted to admins',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Multiple File Upload',
    required: true,
    type: UploadFilesDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
    type: UploadCoverResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Конфлікт завантаження файлів ',
  })
  @UseInterceptors(AnyFilesInterceptor(multerOptionsFiles()))
  async uploadFiles(
    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    // console.log(files);

    try {
      // const envValue = this.configService.get<string>('SERVER_IP');
      return {
        uploaded: files.map((f) => ({
          originalName: f.originalname,
          savedName: f.filename,
          path: `${f.path}`,
        })),
      };
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

  @Public()
  @Get('temporaryCovers/:imageName')
  async serveTemporaryCover(
    @Res() res: Response,
    @Param() params: TemporaryImageParamsDto,
  ) {
    const filePath = this.storageService.getTemporaryCover(params.imageName);
    return res.sendFile(filePath);
  }

  @ApiBearerAuth()
  @Roles(Role.User, Role.Admin)
  @Get('temporaryFiles/:file')
  async serveTemporaryFile(
    @Res() res: Response,
    @Param() params: TemporaryFileParamsDto,
  ) {
    const filePath = this.storageService.getTemporaryFile(params.file);
    return res.sendFile(filePath);
  }

  @Public()
  @Get('covers/:imageName')
  async serveCover(
    @Param() params: DownloadImageParamsDto,
    @Res() res: Response,
  ) {
    const filePath = await this.storageService.getCover(params.imageName);
    if (!filePath) {
      return res.status(404).json({ message: 'Файл не знайдено' });
    }
    return res.sendFile(filePath);
  }

  @ApiBearerAuth()
  @Roles(Role.User, Role.Admin)
  @Get('file/:file')
  async serveFile(
    @Res() res: Response,
    @Param() params: DownloadFileParamsDto,
  ) {
    // const filePath = await this.storageService.getFile(params.file);
    // return res.sendFile(filePath);
    const file = await this.storageService.getFile(params.file);
    if (!file) {
      return res.status(404).json({ message: 'Файл не знайдено' });
    }

    return res.download(
      file.rootFolder + '/' + file.file.path,
      file.file.originalName,
    );
  }
}
