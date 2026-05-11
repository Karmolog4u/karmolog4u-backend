import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from 'src/role/role.enum';
import { Roles } from 'src/role/roles.decorator';
import { CourseService } from './course.service';
import { User } from 'src/common/decorators/user.decorator';
import { UserEntity } from '../dto/user-entity.dto';
import { HasCourseGuard } from './guard/hasCourseGuard';
// import { GcsService } from 'src/gcs/gcs.service';
import { Response } from 'express';

import { IdParams } from './dto/id.dto';
import { Public } from 'src/common/decorators/isPublic.decorator';
import { QAArrayDto } from './dto/feedback.dto';

@ApiBearerAuth()
//@UseGuards(AuthGuard)
@ApiTags('user-education')
@Roles(Role.User, Role.Admin)
@Controller('user/education')
export class CourseController {
  constructor(
    private courseService: CourseService, // private readonly gcsService: GcsService,
  ) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Get course detail' })
  @ApiResponse({
    status: 200,
    description: 'Course data',
    // type: UserInfoResponseDto,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Course ID',
    example: '65fa9a9e3c7a9e2fbc123456',
  })
  @ApiNotFoundResponse({ description: 'Користувача не знайдено' })
  @UseGuards(HasCourseGuard)
  async getCourseDetail(@User() user: UserEntity, @Param() param: IdParams) {
    try {
      return await this.courseService.getCourseDetail(user._id, param.id);
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

  @Get('lessons-SSK/:id')
  @ApiOperation({ summary: 'Get lessons ssk' })
  @ApiResponse({
    status: 200,
    description: 'Lessons SSK data',
    // type: UserInfoResponseDto,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Course ID',
    example: '65fa9a9e3c7a9e2fbc123456',
  })
  @ApiNotFoundResponse({ description: 'Користувача не знайдено' })
  @UseGuards(HasCourseGuard)
  async getLessonsSSK(@User() user: UserEntity, @Param() param: IdParams) {
    try {
      return await this.courseService.getLessonsSSK(user._id, param.id);
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

  @Get('lessons-list/:id')
  @ApiOperation({ summary: 'Get lessons cons advan' })
  @ApiResponse({
    status: 200,
    description: 'Lessons Consulting & Advanced data',
    // type: UserInfoResponseDto,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Course ID',
    example: '65fa9a9e3c7a9e2fbc123456',
  })
  @ApiNotFoundResponse({ description: 'Користувача не знайдено' })
  @UseGuards(HasCourseGuard)
  async getLessonsList(@User() user: UserEntity, @Param() param: IdParams) {
    try {
      return await this.courseService.getLessonsList(user._id, param.id);
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

  @Get('lesson/:id')
  @ApiOperation({ summary: 'Get user' })
  @ApiResponse({
    status: 200,
    description: 'User data',
    // type: UserInfoResponseDto,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'lesson ID',
    example: '65fa9a9e3c7a9e2fbc123456',
  })
  @ApiNotFoundResponse({ description: 'Користувача не знайдено' })
  async getLessonDetails(@User() user: UserEntity, @Param() param: IdParams) {
    try {
      return await this.courseService.getLesson(user._id, param.id);
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

  @Public()
  @Post('feedback/:id')
  @ApiOperation({ summary: 'Post Feedback' })
  @ApiResponse({
    status: 200,
    description: 'feedback',
    // type: UserInfoResponseDto,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID',
    example: '65fa9a9e3c7a9e2fbc123456',
  })
  @ApiNotFoundResponse({ description: 'Користувача не знайдено' })
  async sendFeedback(
    @User() user: UserEntity,
    @Param() param: IdParams,
    @Body() data: QAArrayDto,
  ) {
    try {
      return await this.courseService.sendFeedback(user, param.id, data);
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

  @Get('certificate/:id')
  @ApiOperation({ summary: 'Stream certificate file from storage' })
  @ApiResponse({ status: 200, description: 'Certificate file stream' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Course ID (used for access check)',
    example: '65fa9a9e3c7a9e2fbc123456',
  })
  @UseGuards(HasCourseGuard)
  async streamCertificate(
    @Res() res: Response,
    @User() user: UserEntity,
    @Param('id') courseId: string,
  ) {
    try {
      const certificate = await this.courseService.getCertificate(
        user,
        courseId,
      );

      //drive

      res.set({
        'Content-Type': certificate.file.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${certificate.certificateFileName}"`,
      });

      certificate.file.stream.pipe(res);

      //cloud storage

      // const stream = certificate.file.stream as NodeJS.ReadableStream;
      // const metadata = certificate.file.metadata as any;
      // const name = certificate.certificateFileName;

      // if (metadata && metadata.contentType) {
      //   res.setHeader('Content-Type', metadata.contentType);
      // } else {
      //   res.setHeader('Content-Type', 'application/pdf');
      // }

      // res.setHeader(
      //   'Content-Disposition',
      //   `attachment; filename="${name.split('/').pop()}"`,
      // );

      // stream.on('error', () => {
      //   res.status(500).end();
      // });

      // stream.pipe(res);
    } catch (error) {
      throw new HttpException(
        {
          status: error.status || 500,
          message: error.response?.message || error.message || 'Error',
        },
        error.status || 500,
        {
          cause: error,
        },
      );
    }
  }
}
