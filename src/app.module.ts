import { StorageModule } from './storage/storage.module';
import { DiscountModule } from './admin/products/discount/discount.module';
import { ProductModule } from './products/product.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getEnvPath } from './common/helper/env.helper';
import { validate } from './common/helper/env.validation';
import { LoggerMiddleware } from './common/middleware/logger.middlvare';
// import { ServeStaticModule } from '@nestjs/serve-static';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { StorageService } from './storage/storage.service';
import { FilesModule } from './files/files.module';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
  imports: [
    ConfigModule.forRoot({ validate, envFilePath, isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URL'),
      }),
    }),
    StorageModule,
    DiscountModule,
    TokenModule,
    UserModule,
    AuthModule,
    AdminModule,
    ProductModule,
    MailModule,
    FilesModule,
    // ServeStaticModule.forRoot({
    //   rootPath: 'covers',
    //   serveRoot: '/covers', // Optional: URL prefix for accessing the files
    // }),
  ],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private readonly storageService: StorageService) {}

  async onModuleInit() {
    console.log('App Module Initialized');
    await this.storageService.createStorageFolder(); // Call function on startup
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
