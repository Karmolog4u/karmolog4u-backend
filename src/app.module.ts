import { DriveModule } from './drive/drive.module';
import { CoursePurchaseModule } from './coursePurchase/coursePurchase.module';
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
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { StorageService } from './storage/storage.service';
import { FilesModule } from './files/files.module';
import { CourseModule } from './user/education/course.module';
import { ContractParticipantModule } from './user/education/сontractParticipant/contract.module';
import { PaymentsModule } from './payments/payments.module';
import { EventsModule } from './events/events.module';

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
    // GcsModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     projectId: config.get<string>('GCP_PROJECT_ID'),
    //     bucket: config.get<string>('GCP_BUCKET'),
    //     credentials: {
    //       client_email: config.get<string>('GCP_CLIENT_EMAIL'),
    //       private_key: config
    //         .get<string>('GCP_PRIVATE_KEY')
    //         ?.replace(/\\n/g, '\n'),
    //     },
    //   }),
    // }),
    DriveModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        clientEmail: config.get<string>('GCP_CLIENT_EMAIL'),
        privateKey: config
          .get<string>('GCP_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
        folderId: config.get<string>('GOOGLE_API_FOLDER'),
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      }),
    }),
    AuthModule,
    TokenModule,
    UserModule,
    MailModule,
    StorageModule,
    DiscountModule,
    AdminModule,
    ProductModule,
    FilesModule,
    CoursePurchaseModule,
    CourseModule,
    ContractParticipantModule,
    PaymentsModule,
    EventsModule,

    // ProductPurchaseModule,
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
