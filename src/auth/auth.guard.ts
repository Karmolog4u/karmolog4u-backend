import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
// import { TokenService } from 'src/token/token.service';
// import { UserService } from 'src/user/user.service';
// import { ObjectId } from 'mongodb';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorators/isPublic.decorator';
import { AuthService } from './auth.service';
import { OPTIONAL_AUTH_KEY } from 'src/common/decorators/optional-auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    // private jwtService: JwtService,
    // private configService: ConfigService,
    // private readonly tokenService: TokenService,
    // // private readonly userService: UserService,
    private readonly authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isOptionalAuth = this.reflector.getAllAndOverride<boolean>(
      OPTIONAL_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    // const secret = this.configService.get<string>('JWT_SECRET');

    // OPTIONAL AUTH ROUTES
    if (isOptionalAuth) {
      if (!token) {
        return true;
      }

      try {
        const user = await this.authService.verifyUserCredentials(token);

        request['user'] = user;
        request['accessToken'] = token;
      } catch {
        return true;
      }

      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Відсутній токен!');
    }
    try {
      // await this.jwtService.verifyAsync(token, {
      //   secret,
      // });

      // const tokenDb = await this.tokenService.findToken({
      //   accessToken: token,
      // });

      // const user = await this.userService.findUserById({
      //   _id: new ObjectId(tokenDb.owner.toString()),
      // });
      const user = await this.authService.verifyUserCredentials(token);

      request['user'] = user;
      request['accessToken'] = token;
    } catch {
      throw new UnauthorizedException('Неавторизований');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
