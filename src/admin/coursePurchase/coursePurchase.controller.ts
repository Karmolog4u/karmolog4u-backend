import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/role.enum';
import { AddCoursePurchaseDto } from './dto/add-course-purchase.dto';
import { CoursePurchaseService } from './coursePurchase.service';
import { CoursePurchaseStatusDto } from './dto/change-status-course-purchase.dto';
import { PurchaseIdDto } from './dto/change-status-course-purchase-param.dto';
import { UserIdParamDto } from './dto/user-id-params.dto';

@ApiBearerAuth()
@ApiTags('admin-course-purchase')
@Roles(Role.Admin)
@Controller('admin/coursePurchase')
export class CoursePurchaseController {
  constructor(private coursePurchaseService: CoursePurchaseService) {}

  @Post('add/:userId')
  @ApiOperation({
    summary: 'Admin Add Courses To User',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    description: 'Upload fields',
    type: AddCoursePurchaseDto,
  })
  @ApiBadRequestResponse({
    description: 'Виникла помилка(',
  })
  async createCourse(
    @Body()
    data: AddCoursePurchaseDto,
    @Param() params: UserIdParamDto,
  ) {
    try {
      return await this.coursePurchaseService.addCoursePurchases(
        params.userId,
        data,
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

  @Get('get-all/:userId')
  @ApiOperation({
    summary: 'Admin Get User Courses',
    description: 'Access restricted to admins',
  })
  @ApiBadRequestResponse({
    description: 'Не вдалося отримати покупки користувача',
  })
  async getAllCoursePurchase(@Param() param: UserIdParamDto) {
    try {
      return await this.coursePurchaseService.getAllUserPurchase(param.userId);
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

  @Post('status/:purchaseId')
  @ApiOperation({
    summary: 'Admin Change Status Course Purchase',
    description: 'Access restricted to admins',
  })
  @ApiNotFoundResponse({
    description: 'Покупку з ід ${purchaseId} не знайдено',
  })
  async changeStatusPurchase(
    @Param() param: PurchaseIdDto,
    @Body() data: CoursePurchaseStatusDto,
  ) {
    try {
      return await this.coursePurchaseService.updateStatusCoursePurchase(
        param.purchaseId,
        data.status,
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

  @Patch('extend-access/:purchaseId')
  @ApiOperation({
    summary: 'Admin Change Status Course Purchase',
    description: 'Access restricted to admins',
  })
  @ApiNotFoundResponse({
    description: 'Покупку з ід ${purchaseId} не знайдено',
  })
  async extendAccessPurchase(@Param() param: PurchaseIdDto) {
    try {
      return await this.coursePurchaseService.extendAccessCoursePurchase(
        param.purchaseId,
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

  @Patch('extend-practice/:purchaseId')
  @ApiOperation({
    summary: 'Admin Change Status Course Purchase',
    description: 'Access restricted to admins',
  })
  @ApiNotFoundResponse({
    description: 'Покупку з ід ${purchaseId} не знайдено',
  })
  async extendPracticePurchase(@Param() param: PurchaseIdDto) {
    try {
      return await this.coursePurchaseService.extendPracticeCoursePurchase(
        param.purchaseId,
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

  // @Post('lesson-half-access/:purchaseId')
  // @ApiOperation({
  //   summary: 'Admin Change Status Course Purchase',
  //   description: 'Access restricted to admins',
  // })
  // @ApiNotFoundResponse({
  //   description: 'Покупку з ід ${purchaseId} не знайдено',
  // })
  // async lessonHalfAccessPurchase(@Param() param: PurchaseIdDto) {
  //   try {
  //     return await this.coursePurchaseService.halfAccessLesson(
  //       param.purchaseId,
  //     );
  //   } catch (error) {
  //     throw new HttpException(
  //       {
  //         status: error.status,
  //         message: error.response.message,
  //         error: error.response.error,
  //       },
  //       error.status,
  //       {
  //         cause: error,
  //       },
  //     );
  //   }
  // }

  @Post('complete-access/:purchaseId')
  @ApiOperation({
    summary: 'Admin Change Status Course Purchase',
    description: 'Access restricted to admins',
  })
  @ApiNotFoundResponse({
    description: 'Покупку з ід ${purchaseId} не знайдено',
  })
  async completeAccessPurchase(@Param() param: PurchaseIdDto) {
    try {
      return await this.coursePurchaseService.completeAccess(param.purchaseId);
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

  //   @Post('activate-consulting-advanced/:userId')
  //   @ApiOperation({
  //     summary: 'Admin Change Status Course Purchase',
  //     description: 'Access restricted to admins',
  //   })
  //   @ApiBody({
  //     description: 'Upload fields',
  //     type: ActivateConsultingAdvancedDto,
  //   })
  //   @ApiBadRequestResponse({
  //     description: 'Виникла помилка(',
  //   })
  //   async activateConsultingAdvanced(
  //     @Param() params: UserIdParamDto,
  //     @Body()
  //     data: ActivateConsultingAdvancedDto,
  //   ) {
  //     try {
  //       return await this.coursePurchaseService.activateConsultingAdvanced(
  //         params.userId,
  //         data.courseId,
  //       );
  //     } catch (error) {
  //       throw new HttpException(
  //         {
  //           status: error.status,
  //           message: error.response.message,
  //           error: error.response.error,
  //         },
  //         error.status,
  //         {
  //           cause: error,
  //         },
  //       );
  //     }
  //   }
}
