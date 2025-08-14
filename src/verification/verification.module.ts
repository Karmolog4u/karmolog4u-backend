import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Verification,
  VerificationSchema,
} from './schemas/verification.schema';
import { VerificationService } from './verification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Verification.name, schema: VerificationSchema },
    ]),
  ],
  controllers: [],
  providers: [VerificationService],
  exports: [MongooseModule, VerificationService],
})
export class VerificationModule {}
