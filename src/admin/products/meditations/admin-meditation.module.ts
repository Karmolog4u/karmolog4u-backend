import { Module } from '@nestjs/common';
import { AdminMeditationController } from './admin-meditation.controller';
import { AdminMeditationService } from './admin-meditation.service';
import { MongooseModule } from '@nestjs/mongoose';

//change later?
import {
  Meditation,
  MeditationSchema,
} from 'src/products/meditations/schemas/meditation.schema';
import { DiscountModule } from '../discount/discount.module';
// import { Discount, DiscountSchema } from '../discount/schemas/discount.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Meditation.name, schema: MeditationSchema },
      // { name: Discount.name, schema: DiscountSchema },
    ]),
    DiscountModule,
  ],
  controllers: [AdminMeditationController],
  providers: [AdminMeditationService],
  exports: [AdminMeditationService, MongooseModule],
})
export class AdminMeditationModule {}
