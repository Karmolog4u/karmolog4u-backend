import { Module } from '@nestjs/common';
import { SendApplicationController } from './send-application.controller';
import { SendApplicationService } from './send-application.service';
import { MailModule } from 'src/mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AssociationApplication,
  AssociationApplicationSchema,
} from './schemas/send-application.schema';

@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([
      {
        name: AssociationApplication.name,
        schema: AssociationApplicationSchema,
      },
    ]),
  ],
  controllers: [SendApplicationController],
  providers: [SendApplicationService],
})
export class SendApplicationModule {}
