import { UserModule as UserMainModule } from 'src/user/user.module';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserMainModule, AuthModule, MailModule, ConfigModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
