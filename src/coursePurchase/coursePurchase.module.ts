import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CoursePurchase,
  CoursePurchaseSchema,
} from './schemas/coursePurchase.schema';
import { CoursePurchaseController } from './coursePurchase.controller';
import { CoursePurchaseService } from './coursePurchase.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CoursePurchase.name, schema: CoursePurchaseSchema },
    ]),
  ],
  controllers: [CoursePurchaseController],
  providers: [CoursePurchaseService],
  exports: [MongooseModule, CoursePurchaseService],
})
export class CoursePurchaseModule {}
