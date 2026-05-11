import { ResponseSuccessDto } from './../user/dto/response-success.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './../token/token.service';
import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { UserEntity } from '../user/dto/user-entity.dto';
import { ConfigService } from '@nestjs/config';
import { TokenResponseDto } from 'src/token/dto/token-response.dto';
import { HeadersDataDto } from './dto/headers-data.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { generateUniquePassword } from 'src/common/helper/generatePassword';
import { VerificationService } from 'src/verification/verification.service';
import { MailService } from 'src/mail/mail.service';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    // @Inject(UserService) private userService: UserService,
    @Inject(TokenService) private tokenService: TokenService,
    @Inject(JwtService) private jwtService: JwtService,
    @Inject(VerificationService) private verifyService: VerificationService,
    @Inject(MailService) private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async singUp(registerUserDto: RegisterUserDto) {
    try {
      const user = await this.userService.newUser(registerUserDto);
      const verifyToken = await this.jwtService.signAsync({
        _id: user._id,
        email: user.email,
      });
      if (!verifyToken) {
        throw new InternalServerErrorException('Помилка створення токену');
      }
      await this.verifyService.createVerifyToken({
        userId: user._id,
        email: user.email,
        token: verifyToken,
      });
      //якщо не verified тоді надсилає емейл
      if (!registerUserDto?.verified) {
        await this.mailService.sendEmail(
          user.email,
          'Verify Your Email Address',
          'verifyEmail', // HBS template name
          {
            name: user.name, // User's full name
            verifyUrl: `${this.configService.get<string>(
              'FRONT_DOMAIN',
            )}/cabinet/verify?token=${verifyToken}`, // Verification link
            appName: 'Karmolog4u',
            year: new Date().getFullYear(),
          },
        );
      }
      return user;
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

  async singIn(
    loginUserDto: LoginUserDto,
    headersData: HeadersDataDto,
  ): Promise<LoginResponseDto> {
    try {
      const user = await this.userService.findUserByEmail({
        email: loginUserDto.email,
      });
      if (!user.verified) {
        throw new ForbiddenException('Користувач не верифікований');
      }
      const decodePassword = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );
      if (!decodePassword) {
        throw new UnauthorizedException('Неправильний пароль');
      }
      await this.userService.updateUser(user._id, {
        lastLogin: new Date(),
      });

      const fieldsToKeep = [
        'name',
        'lastName',
        'email',
        'mobPhone',
        'role',
        'id',
      ];
      const serializedUser: Record<string, any> = {};
      fieldsToKeep.forEach((field) => {
        if (field === '_id') {
          serializedUser['id'] = user._id.toString(); // Конвертуємо ObjectId у string
        } else {
          serializedUser[field] = user[field];
        }
      });

      const accessPayload = { sub: user._id, serializedUser };
      const refreshPayload = { sub: user._id };

      const accessToken_expired = this.configService.get<string>(
        'ACCESS_TOKEN_EXPIRED',
      );
      const refreshToken_expired = this.configService.get<string>(
        'REFRESH_TOKEN_EXPIRED',
      );
      const accessToken = await this.jwtService.signAsync(accessPayload, {
        expiresIn: accessToken_expired,
      });
      const refreshToken = await this.jwtService.signAsync(refreshPayload, {
        expiresIn: refreshToken_expired,
      });
      if (!accessToken || !refreshToken) {
        throw new InternalServerErrorException('Помилка створення токену');
      }
      const daysToAdd = parseInt(
        this.configService.get<string>('DOCUMENT_TOKEN_EXPIRED'),
        10,
      );
      const expiredAt = new Date(
        new Date().getTime() + daysToAdd * 24 * 60 * 60 * 1000,
      );
      const token = await this.tokenService.newToken({
        accessToken,
        refreshToken,
        ...headersData,
        owner: user._id,
        expiredAt,
      });

      return {
        user: {
          userData: serializedUser,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
        },
      };
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

  async singOut(
    accessToken: string,
    user: UserEntity,
  ): Promise<ResponseSuccessDto> {
    try {
      await this.tokenService.deleteToken({
        accessToken,
        owner: user._id,
      });
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

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(refreshTokenDto.token, {
        secret: secret,
      });
      if (!payload) {
        throw new UnauthorizedException('Недійсний або протермінований токен');
      }
      const tokenInstance = await this.tokenService.findToken({
        refreshToken: refreshTokenDto.token,
        owner: payload.sub,
      });
      const user = await this.userService.findUserById({ _id: payload.sub });

      const accessPayload = {
        sub: payload.sub,
        user: user,
      };

      const accessToken_expired = this.configService.get<string>(
        'ACCESS_TOKEN_EXPIRED',
      );

      const accessToken = await this.jwtService.signAsync(accessPayload, {
        expiresIn: accessToken_expired,
      });
      if (!accessToken) {
        throw new InternalServerErrorException('Помилка створення токену');
      }
      const newToken = await this.tokenService.updateToken({
        accessToken,
        id: tokenInstance._id,
      });
      return newToken;
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

  async resetPassword(data: ResetPasswordDto): Promise<ResponseSuccessDto> {
    try {
      const user = await this.userService.findUserByEmail({
        email: data.email,
      });
      if (!user.verified) {
        throw new ForbiddenException('Користувач не верифікований');
      }
      const newPassword = generateUniquePassword(16, {
        includeUppercase: true,
        includeNumbers: true,
        includeSymbols: true,
      });
      await this.userService.updateUserPassword(user._id, newPassword);
      await this.tokenService.deleteAllSession(user._id);
      await this.mailService.sendEmail(
        user.email,
        'Password Recovery',
        'resetPassword', // HBS template name
        {
          name: user.name, // User's full name
          password: newPassword, // Newly generated password
          loginUrl: `${this.configService.get<string>(
            'FRONT_DOMAIN',
          )}/auth/login`, // Login page URL
          appName: 'Karmolog4u',
          year: new Date().getFullYear(),
        },
      );
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

  async verifyUser(token: string) {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });
      if (!payload) {
        throw new BadRequestException('Недійсний або протермінований токен');
      }
      const verifyToken = await this.verifyService.getVerifyToken({
        userId: payload._id,
        email: payload.email,
      });
      if (verifyToken.token != token) {
        throw new BadRequestException('Невірний токен верифікації');
      }
      await this.userService.updateUser(verifyToken.userId, { verified: true });
      await this.verifyService.deleteVerifyToken({ _id: verifyToken._id });
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

  async resendVerification(
    data: ResendVerificationDto,
  ): Promise<ResponseSuccessDto> {
    try {
      const user = await this.userService.findUserByEmail({
        email: data.email,
      });
      if (user.verified) {
        throw new BadRequestException('Користувач верифікований');
      }
      const verifyToken = await this.verifyService.getVerifyToken({
        userId: user._id,
        email: user.email,
      });
      await this.mailService.sendEmail(
        user.email,
        'Verify Your Email Address',
        'verifyEmail', // HBS template name
        {
          name: user.name, // User's full name
          verifyUrl: `${this.configService.get<string>(
            'FRONT_DOMAIN',
          )}/cabinet/verify?token=${verifyToken.token}`, // Verification link
          appName: 'Karmolog4u',
          year: new Date().getFullYear(),
        },
      );
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

  async verifyUserCredentials(token) {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      await this.jwtService.verifyAsync(token, {
        secret,
      });

      const tokenDb = await this.tokenService.findToken({
        accessToken: token,
      });

      const user = await this.userService.findUserById({
        _id: new ObjectId(tokenDb.owner.toString()),
      });
      return user;
    } catch (error) {
      throw new Error();
    }
  }
}
