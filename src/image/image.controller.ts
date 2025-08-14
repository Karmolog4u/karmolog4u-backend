// import { FileInterceptor } from '@nestjs/platform-express';
// import {
//   Controller,
//   Get,
//   HttpException,
//   Param,
//   Post,
//   Res,
//   UploadedFile,
//   UseInterceptors,
// } from '@nestjs/common';
// import {
//   ApiBearerAuth,
//   ApiBody,
//   ApiConsumes,
//   ApiOperation,
//   ApiResponse,
//   ApiTags,
// } from '@nestjs/swagger';
// import { Response } from 'express';
// import * as path from 'path';
// import { Public } from 'src/common/decorators/isPublic.decorator';
// import { ConfigService } from '@nestjs/config';
// // import { UploadImageResponseDto } from '../storage/dto/upload-cover-response.dto';
// import { multerImageOptions } from 'src/common/helper/multerImageOption';
// import { DownloadImageParamsDto } from '../storage/dto/download-image-params.dto';
// // import { findFile } from 'src/common/helper/findFileRecursive';
// import { Roles } from 'src/role/roles.decorator';
// import { Role } from 'src/role/role.enum';

// @ApiTags('image')
// @Controller()
// export class ImageController {
//   constructor(private readonly configService: ConfigService) {}
//   // @Public()
//   // @Get(':imageName')
//   // async getImage(
//   //   @Param() params: DownloadImageParamsDto,
//   //   @Res() res: Response,
//   // ) {
//   //   // const dir = await findFile(params.imageName);
//   //   // const imagePath = path.join(__dirname, '..', '..', dir, params.imageName);
//   //   // return res.sendFile(imagePath);
//   // }

//   // @ApiBearerAuth()
//   // @Roles(Role.Admin)
//   // @Post('uploadImage')
//   // @ApiOperation({
//   //   summary: 'Admin Upload Image',
//   //   description: 'Access restricted to admins',
//   // })
//   // @ApiConsumes('multipart/form-data')
//   // @ApiBody({
//   //   description: 'File upload',
//   //   schema: {
//   //     type: 'object',
//   //     properties: {
//   //       image: {
//   //         type: 'string',
//   //         format: 'binary',
//   //       },
//   //     },
//   //   },
//   // })
//   // @ApiResponse({
//   //   status: 201,
//   //   description: 'Успішно',
//   //   type: UploadImageResponseDto,
//   // })
//   // @ApiResponse({
//   //   status: 400,
//   //   description: 'Конфлікт завантаження зображення ',
//   // })
//   // @UseInterceptors(FileInterceptor('image', multerImageOptions()))
//   // async uploadImage(
//   //   @UploadedFile()
//   //   file: Express.Multer.File,
//   // ) {
//   //   try {
//   //     const envValue = this.configService.get<string>('SERVER_IP');
//   //     return { link: `${envValue}${file.filename}` };
//   //   } catch (error) {
//   //     throw new HttpException(
//   //       {
//   //         status: error.status,
//   //         message: error.response.message,
//   //         error: error.response.error,
//   //       },
//   //       error.status,
//   //       {
//   //         cause: error,
//   //       },
//   //     );
//   //   }
//   // }
// }
