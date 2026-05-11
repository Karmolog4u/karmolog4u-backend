import { Controller, Get, HttpException } from '@nestjs/common';
import { CoursePurchaseService } from './coursePurchase.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/role.enum';
import { User } from 'src/common/decorators/user.decorator';
import { UserEntity } from 'src/user/dto/user-entity.dto';

@ApiBearerAuth()
@ApiTags('course-purchase')
@Roles(Role.User)
@Controller('/coursePurchase')
export class CoursePurchaseController {
  constructor(private coursePurchaseService: CoursePurchaseService) {}

  @Get('get-all-course')
  @ApiOperation({
    summary: 'Get User Course',
    description: 'Access restricted to auth users',
  })
  @ApiBadRequestResponse({
    description: 'Не вдалося отримати покупки користувача',
  })
  async getAllCoursePurchase(@User() user: UserEntity) {
    try {
      return await this.coursePurchaseService.getAllCourse(user._id);
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

  @Get('get-achievement')
  @ApiOperation({
    summary: 'Get User Course',
    description: 'Access restricted to auth users',
  })
  @ApiBadRequestResponse({
    description: 'Не вдалося отримати покупки користувача',
  })
  async getAchievementCoursePurchase(@User() user: UserEntity) {
    try {
      return await this.coursePurchaseService.getAchievement(user._id);
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
