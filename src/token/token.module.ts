import { MongooseModule } from '@nestjs/mongoose';
import { TokenService } from './token.service';

import { Module } from '@nestjs/common';
import { Token, TokenSchema } from './schemas/token.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    ConfigModule,
  ],
  controllers: [],
  providers: [TokenService],
  exports: [TokenService, MongooseModule],
})
export class TokenModule {}
