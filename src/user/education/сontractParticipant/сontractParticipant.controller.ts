import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from 'src/role/role.enum';
import { Roles } from 'src/role/roles.decorator';

import { HasCourseGuard } from '../guard/hasCourseGuard';
import { User } from 'src/common/decorators/user.decorator';
import { UserEntity } from 'src/user/dto/user-entity.dto';
import { ContractParticipantService } from './сontractParticipant.service';
import { SignDto } from './dto/sign.dto';
import { Response } from 'express';
import { IdParams } from '../dto/id.dto';

@ApiBearerAuth()
@ApiTags('Contract Participant')
@ApiUnauthorizedResponse({
  description: 'Unauthorized - Missing or invalid authentication token',
})
@Roles(Role.User, Role.Admin)
@Controller('contract')
export class ContractParticipantController {
  constructor(private contractService: ContractParticipantService) {}

  /**
   * Sign a contract by user
   * - Validate user access to course
   * - Create contract participant record
   * - Update course purchase agreement status
   * - Send notification emails to admin and user with PDF
   */
  @Post('sign/:id')
  @UseGuards(HasCourseGuard)
  @ApiOperation({
    summary: 'Sign contract',
    description:
      'User signs a contract for a purchased course. Sends notifications to admin and user.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Course ID',
    type: 'string',
    example: '65fa9a9e3c7a9e2fbc123456',
  })
  @ApiBody({
    type: SignDto,
    description: 'Contract signature data',
  })
  @ApiCreatedResponse({
    description: 'Contract signed successfully',
    schema: {
      example: {
        statusCode: 201,
        message: 'Contract signed successfully',
        data: {
          contractParticipantId: '65fa9a9e3c7a9e2fbc123456',
          userId: '65fa9a9e3c7a9e2fbc123456',
          courseId: '65fa9a9e3c7a9e2fbc123456',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - Contract not found or already signed',
    schema: {
      example: {
        statusCode: 400,
        message: 'Contract not signed or invalid data',
        error: 'Bad Request',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Server error while signing contract',
  })
  async signContract(
    @User() user: UserEntity,
    @Body() data: SignDto,
    @Param() param: IdParams,
  ) {
    try {
      console.log(param.id);

      const result = await this.contractService.sign(user, data, param.id);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Contract signed successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to sign contract',
          error: error.response?.error || 'Internal Server Error',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }

  /**
   * Get contract by course ID
   * - Verify user access to course
   * - Validate contract signature
   * - Generate and download PDF
   */
  @Get('download/:id')
  @UseGuards(HasCourseGuard)
  @ApiOperation({
    summary: 'Download signed contract',
    description:
      'Download the signed contract as PDF. User must have access to the course.',
  })
  @ApiParam({
    name: 'courseId',
    required: true,
    description: 'Course ID',
    type: 'string',
    example: '65fa9a9e3c7a9e2fbc123456',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'PDF file downloaded successfully',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiBadRequestResponse({
    description: 'Contract not signed or not found',
    schema: {
      example: {
        statusCode: 400,
        message: 'Contract not signed',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Server error while generating PDF',
  })
  async getContractDownload(
    @User() user: UserEntity,
    @Param() param: IdParams,
    @Res() res: Response,
  ) {
    try {
      const pdf = await this.contractService.downloadContract(user, param.id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=contract_${
          user._id
        }_${Date.now()}.pdf`,
        'Content-Length': pdf.length,
      });

      res.end(pdf);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to generate contract PDF',
          error: error.response?.error || 'Internal Server Error',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }

  @Get('get/:id')
  @UseGuards(HasCourseGuard)
  @ApiOperation({
    summary: 'Get contract information',
    description:
      'Get contract details and signing status for a specific course',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Course ID',
    type: 'string',
    example: '65fa9a9e3c7a9e2fbc123456',
  })
  @ApiOkResponse({
    description: 'Contract information retrieved successfully',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            agreement: { type: 'boolean', example: false },
          },
        },
        {
          type: 'object',
          properties: {
            agreement: { type: 'boolean', example: true },
            contractDetails: {
              type: 'object',
              properties: {
                contractId: { type: 'string' },
                courseId: { type: 'string' },
                courseName: { type: 'string' },
                userId: { type: 'string' },
                fullname: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                idCode: { type: 'string' },
                passportData: { type: 'string' },
                signedAt: { type: 'string', format: 'date-time' },
                contractDate: { type: 'string', format: 'date-time' },
                header: { type: 'string' },
                points: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Course not found in purchases',
    schema: {
      example: {
        statusCode: 400,
        message: 'Курс не знайдено в покупках',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Server error while retrieving contract information',
  })
  async getContractInfo(@User() user: UserEntity, @Param() param: IdParams) {
    try {
      const result = await this.contractService.getContractDetails(
        user,
        param.id,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Contract information retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to get contract information',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }
}
