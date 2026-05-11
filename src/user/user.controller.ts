import { UserInfoResponseDto } from './dto/user-info-response.dto';
import {
  Controller,
  HttpException,
  Post,
  Body,
  Get,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/common/decorators/user.decorator';
import { UserEntity } from 'src/user/dto/user-entity.dto';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/role.enum';
import { UpdateByUserDto } from './dto/update-by-user.dto';

@ApiBearerAuth()
// @UseGuards(AuthGuard)
@ApiTags('user')
@Roles(Role.User, Role.Admin)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get user' })
  @ApiResponse({
    status: 200,
    description: 'User data',
    type: UserInfoResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Користувача не знайдено' })
  async get(@User() user: UserEntity): Promise<UserInfoResponseDto> {
    try {
      return await this.userService.getUserInfo({ id: user._id });
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

  @Post('update')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: UserInfoResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Помилка оновлення користувача' })
  @HttpCode(200)
  async updateByUser(
    @Body() userData: UpdateByUserDto,
    @User() user: UserEntity,
  ): Promise<UserInfoResponseDto> {
    try {
      return await this.userService.updateByUser(user._id, userData);
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
}
