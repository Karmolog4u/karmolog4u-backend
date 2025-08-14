import { RefreshTokenResponse } from './dto/refresh-token-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpException,
  Ip,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './auth.guard';
import { Token } from 'src/common/decorators/token.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { UserEntity } from '../user/dto/user-entity.dto';
import { Public } from 'src/common/decorators/isPublic.decorator';
import { TokenResponseDto } from 'src/token/dto/token-response.dto';
import { HeadersDataDto } from './dto/headers-data.dto';
import { ResponseSuccessDto } from 'src/common/dto/response-success.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UAParser } from 'ua-parser-js';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiBody({
    type: RegisterUserDto,
  })
  @ApiResponse({
    status: 201,
    description: 'register user',
    type: ResponseSuccessDto,
  })
  @ApiConflictResponse({
    description: 'Email вже зареєстрований або токен вже існує!',
  })
  @ApiInternalServerErrorResponse({
    description: 'Помилка створення токену!',
  })
  @ApiServiceUnavailableResponse({
    description: 'Помилка відправлення email!',
  })
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<ResponseSuccessDto> {
    try {
      await this.authService.singUp(registerUserDto);
      return { message: 'success' };
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
  @Post('login')
  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'login user',
    type: LoginResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Email не знайдено' })
  @ApiForbiddenResponse({ description: 'Користувач не верифікований' })
  @ApiUnauthorizedResponse({ description: 'Неправильний пароль' })
  @ApiInternalServerErrorResponse({
    description: 'Помилка створення токену!',
  })
  @ApiBadRequestResponse({
    description: 'Помилка запису токену в БД!',
  })
  @HttpCode(200)
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Headers('user-agent') userAgent: any,
    @Ip() ip: any,
  ): Promise<LoginResponseDto> {
    try {
      const parser = new UAParser(userAgent);
      const platform = parser.getOS().name || 'undefined';
      const headersData: HeadersDataDto = { platform, userAgent, ip };
      const login = await this.authService.singIn(loginUserDto, headersData);
      return login;
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

  @Post('logout')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'logout user',
    type: ResponseSuccessDto,
  })
  @ApiUnauthorizedResponse({ description: 'Неавторизований' })
  @ApiNotFoundResponse({ description: 'Токен не знайдено або вже видалено' })
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async logout(
    @Token() accessToken: string,
    @User() user: UserEntity,
  ): Promise<ResponseSuccessDto> {
    try {
      return await this.authService.singOut(accessToken, user);
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
  @Post('refresh-token')
  @ApiResponse({
    status: 200,
    description: 'refresh token',
    type: RefreshTokenResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Недійсний або протермінований токен',
  })
  @ApiNotFoundResponse({
    description: 'Токен не знайдено або користувача не існує',
  })
  @ApiInternalServerErrorResponse({
    description: 'Помилка створення токену',
  })
  @ApiForbiddenResponse({
    description: 'Помилка оновлення токену',
  })
  @HttpCode(200)
  async refreshToken(
    @Headers('Authorization') refreshToken: string,
  ): Promise<TokenResponseDto> {
    try {
      const token = refreshToken.split(' ')[1];
      return await this.authService.refreshToken({ token });
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
  @Post('reset-password')
  @ApiBody({
    type: ResetPasswordDto,
  })
  @ApiResponse({
    status: 200,
    description: 'reset password',
    type: ResponseSuccessDto,
  })
  @ApiNotFoundResponse({ description: 'Користувача не знайдено' })
  @ApiForbiddenResponse({ description: 'Користувач не верифікований' })
  @ApiBadRequestResponse({
    description: 'Помилка оновлення паролю або помилка скасування сесій',
  })
  @ApiServiceUnavailableResponse({ description: 'Помилка відправлення email!' })
  @HttpCode(200)
  async resetPassword(
    @Body() data: ResetPasswordDto,
  ): Promise<ResponseSuccessDto> {
    try {
      return await this.authService.resetPassword(data);
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
  @Post('verify')
  @ApiResponse({
    status: 200,
    description: 'verify token',
    type: ResponseSuccessDto,
  })
  @ApiBadRequestResponse({
    description:
      'Недійсний або протермінований токен,Невірний токен верифікації, помилка оновлення користувача',
  })
  @ApiNotFoundResponse({ description: 'Токен верифікації не знайдено' })
  @HttpCode(200)
  async verifyUser(@Query('token') token: string): Promise<ResponseSuccessDto> {
    try {
      return await this.authService.verifyUser(token);
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
  @Post('resend-verification')
  @ApiBody({
    type: ResendVerificationDto,
  })
  @ApiResponse({
    status: 200,
    description: 'resend verification token',
    type: ResponseSuccessDto,
  })
  @ApiNotFoundResponse({
    description: 'Користувача не знайдено, Токен верифікації не знайдено',
  })
  @ApiBadRequestResponse({
    description: 'Користувач верифікований',
  })
  @ApiServiceUnavailableResponse({
    description: 'Помилка відправлення email!',
  })
  @HttpCode(200)
  async resendVerification(
    @Body() data: ResendVerificationDto,
  ): Promise<ResponseSuccessDto> {
    try {
      return await this.authService.resendVerification(data);
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
