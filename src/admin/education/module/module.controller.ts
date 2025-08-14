import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/role.enum';
import mongoose from 'mongoose';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { GetAllModuleResponseDto } from './dto/get-all-module-response.dto';
import { GetAllModuleQueryDto } from './dto/get-all-module-query.dto';
import { GetModuleByIdResponseDto } from './dto/get-module-by-id.dto';
import { GetModuleByIdParams } from './dto/get-module-by-id-params.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { UpdateModuleParamsDto } from './dto/update-module-params.dto';
import { DeleteModuleDto } from './dto/delete-module.dto';
import { GetAllModuleParams } from './dto/get-all-module-params.dto';

@ApiBearerAuth()
@ApiTags('admin-module')
@Roles(Role.Admin)
@Controller('admin/education/modules')
export class ModuleController {
  constructor(private moduleService: ModuleService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Admin Create Module',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    type: CreateModuleDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'Конфлікт створення модуля' })
  async createModule(
    @Body()
    data: CreateModuleDto,
  ) {
    try {
      return await this.moduleService.createModule(data);
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

  @Get('get-all/:id')
  @ApiOperation({
    summary: 'Admin Get All Module',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'get all Module',
    type: [GetAllModuleResponseDto],
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getAllModule(
    @Param() params: GetAllModuleParams,
    @Query() query: GetAllModuleQueryDto,
  ) {
    try {
      const id = new mongoose.Types.ObjectId(params.id.toString());
      return await this.moduleService.getAllModule(
        {
          ...query,
        },
        id,
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

  @Get('get/:id')
  @ApiOperation({
    summary: 'Admin Get Module',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'get course',
    type: GetModuleByIdResponseDto,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getModuleById(@Param() params: GetModuleByIdParams) {
    try {
      const Id = new mongoose.Types.ObjectId(params.id.toString());
      return await this.moduleService.getModuleById(Id);
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
    summary: 'Admin Edit Module',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    type: UpdateModuleDto,
  })
  @ApiResponse({
    status: 200,
    description: 'edit course',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async updateModule(
    @Param() params: UpdateModuleParamsDto,
    @Body() data: UpdateModuleDto,
  ) {
    try {
      const moduleId = new mongoose.Types.ObjectId(params.id.toString());
      return await this.moduleService.updateModule({ id: moduleId, ...data });
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

  @Post('delete')
  @ApiOperation({
    summary: 'Admin Delete Modules',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    type: DeleteModuleDto,
  })
  @ApiResponse({
    status: 200,
    description: 'delete course',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async deleteModule(@Body() data: DeleteModuleDto) {
    try {
      const objectIds = data.moduleIds.map(
        (id) => new mongoose.Types.ObjectId(id.toString()),
      );
      return await this.moduleService.deleteModule(objectIds);
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
