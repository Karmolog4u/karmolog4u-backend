import { ContractParticipantService } from './сontractParticipant.service';
import { ContractParticipantController } from './сontractParticipant.controller';
import { Module } from '@nestjs/common';
import {
  ContractParticipant,
  ContractParticipantSchema,
} from './schemas/сontractParticipant.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursePurchaseModule } from 'src/coursePurchase/coursePurchase.module';
import { MailModule } from 'src/mail/mail.module';
import { ContractModule } from 'src/admin/education/contract/contract.module';
import { PdfModule } from 'src/pdf/pdf.module';
import { CourseModule } from 'src/admin/education/course/course.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ContractParticipant.name,
        schema: ContractParticipantSchema,
      },
    ]),
    CoursePurchaseModule,
    MailModule,
    ContractModule,
    PdfModule,
    CourseModule,
  ],
  controllers: [ContractParticipantController],
  providers: [ContractParticipantService],
})
export class ContractParticipantModule {}
