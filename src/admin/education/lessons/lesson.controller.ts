import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/role.enum';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { GetAllLessonParams } from './dto/get-all-lesson-params.dto';
import { GetAllLessonModuleQueryDto } from './dto/get-all-lesson-module-query.dto';
import { GetAllLessonCourseQueryDto } from './dto/get-all-lesson-course-query.dto';
import { GetByIdLessonParams } from './dto/get-lesson-by-id.dto';
import { UpdateLessonParamsDto } from './dto/update-lesson-params.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { DeleteLessonsDto } from './dto/delete-lesson.dto';
import { UpdateStatusLessonDto } from './dto/update-status-lesson.dto';
import { UpdateStatusLessonParamsDto } from './dto/update-status-lesson-params.dto';
import { UpdateModuleLessonParamsDto } from './dto/update-module-lesson-params.dto';
import { UpdateModuleLessonDto } from './dto/update-module-lesson.dto';

@ApiBearerAuth()
@ApiTags('admin-lessons')
@Roles(Role.Admin)
@Controller('admin/education/lessons')
export class LessonController {
  constructor(private lessonService: LessonService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Admin Create Lesson',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    description: 'Upload a file with additional fields',
    type: CreateLessonDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'Конфлікт створення уроку' })
  async createLesson(
    @Body()
    data: CreateLessonDto,
  ) {
    try {
      return await this.lessonService.createLesson(data);
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

  @Get('get-all/module/:id')
  @ApiOperation({
    summary: 'Admin Get All Lesson',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'get all Lesson',
    // type: [GetAllLessonByModuleResponseDto],
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getAllLessonModule(
    @Param() params: GetAllLessonParams,
    @Query() query: GetAllLessonModuleQueryDto,
  ) {
    try {
      const id = new mongoose.Types.ObjectId(params.id.toString());
      return await this.lessonService.getAllLessonModule({
        ...query,
        targetModel: 'Module',
        targetId: id,
      });
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

  @Get('get-all/course/:id')
  @ApiOperation({
    summary: 'Admin Get All Lesson',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'get all Lesson',
    // type: [GetAllLessonResponseDto],
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getAllLesson(
    @Param() params: GetAllLessonParams,
    @Query() query: GetAllLessonCourseQueryDto,
  ) {
    try {
      const id = new mongoose.Types.ObjectId(params.id.toString());
      return await this.lessonService.getAllLessonCourse({
        ...query,
        targetModel: 'Course',
        targetId: id,
      });
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
    summary: 'Admin Get Lesson',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'get lesson',
    // type: GetLessonByIdDto,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getLessonById(@Param() params: GetByIdLessonParams) {
    try {
      const lessonId = new mongoose.Types.ObjectId(params.id.toString());
      return await this.lessonService.getLessonById(lessonId);
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
    summary: 'Admin Edit Lesson',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    description: 'Upload a file with additional fields',
    type: UpdateLessonDto,
  })
  @ApiResponse({
    status: 200,
    description: 'edit lesson',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async updateLesson(
    @Param() params: UpdateLessonParamsDto,
    @Body() data: UpdateLessonDto,
  ) {
    try {
      const lessonId = new mongoose.Types.ObjectId(params.id.toString());
      return await this.lessonService.updateLesson(lessonId, data);
    } catch (error) {
      console.log(error);

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

  @Post('delete')
  @ApiOperation({
    summary: 'Admin Delete Lessons',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    description: 'Upload a file with additional fields',
    type: DeleteLessonsDto,
  })
  @ApiResponse({
    status: 200,
    description: 'delete lesson',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async deleteLesson(@Body() data: DeleteLessonsDto) {
    try {
      const objectIds = data.lessonIds.map(
        (id) => new mongoose.Types.ObjectId(id.toString()),
      );
      return await this.lessonService.deleteLesson(objectIds);
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
    summary: 'Admin Update Status Lessons',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    description: 'Upload a file with additional fields',
    type: UpdateStatusLessonDto,
  })
  @ApiResponse({
    status: 200,
    description: ' lesson',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async updateStatusLesson(
    @Param() params: UpdateStatusLessonParamsDto,
    @Body() data: UpdateStatusLessonDto,
  ) {
    try {
      const lessonId = new mongoose.Types.ObjectId(params.id.toString());
      return await this.lessonService.updateStatusLesson({
        id: lessonId,
        status: data.status,
      });
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

  @Patch('change_module/:id')
  @ApiOperation({
    summary: 'Admin Update module Lessons',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    description: 'Upload a file with additional fields',
    type: UpdateModuleLessonDto,
  })
  @ApiResponse({
    status: 200,
    description: ' lesson',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async updateModuleLesson(
    @Param() params: UpdateModuleLessonParamsDto,
    @Body() data: UpdateModuleLessonDto,
  ) {
    try {
      const lessonId = new mongoose.Types.ObjectId(params.id.toString());
      const moduleId = new mongoose.Types.ObjectId(data.moduleId.toString());
      return await this.lessonService.updateModuleLesson({
        id: lessonId,
        targetId: moduleId,
      });
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
