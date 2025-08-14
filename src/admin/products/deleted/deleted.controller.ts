import {
  Body,
  Controller,
  Get,
  HttpException,
  Patch,
  Query,
} from '@nestjs/common';
import { DeletedService } from './deleted.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination.dto';
import { RestoreDto } from './dto/restore.dto';
import { DeleteForeverDto } from './dto/delete-forever.dto';
import { GetAllResponseDto } from './dto/get-all.dto';
import { JoiValidationPipe } from 'src/common/pipes/JoiValidationPipe';
import { ProductArrayValidationSchema } from './schemas/validation.schema';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/role.enum';

@ApiBearerAuth()
@ApiTags('admin-deleted-products')
@Roles(Role.Admin)
@Controller('admin/products/deleted')
export class DeletedController {
  constructor(private deletedService: DeletedService) {}

  @Get('get-all')
  @ApiOperation({
    summary: 'Admin Get All Deleted',
    description: 'Access restricted to admins',
  })
  @ApiResponse({
    status: 200,
    description: 'get all deleted',
    type: [GetAllResponseDto],
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async getAll(@Query() query: PaginationDto): Promise<GetAllResponseDto[]> {
    try {
      return await this.deletedService.getAll(query);
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

  @Patch('restore')
  @ApiOperation({
    summary: 'Admin restore selected product(s)',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    description: 'Upload array of products',
    type: [RestoreDto],
  })
  @ApiResponse({
    status: 200,
    description: 'restore selected product(s)',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async restore(
    @Body(new JoiValidationPipe(ProductArrayValidationSchema))
    data: RestoreDto[],
  ): Promise<ResponseSuccessDto> {
    try {
      return await this.deletedService.restoreProducts(data);
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

  @Patch('delete-forever')
  @ApiOperation({
    summary: 'Admin delete forever selected product(s)',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    description: 'Upload array of products',
    type: [DeleteForeverDto],
  })
  @ApiResponse({
    status: 200,
    description: 'delete forever selected product(s)',
    type: ResponseSuccessDto,
  })
  @ApiResponse({ status: 400, description: 'something wrong' })
  async deleteForever(
    @Body(new JoiValidationPipe(ProductArrayValidationSchema))
    data: DeleteForeverDto[],
  ): Promise<ResponseSuccessDto> {
    try {
      return await this.deletedService.deleteProducts(data);
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
