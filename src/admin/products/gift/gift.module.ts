import { GiftService } from './gift.service';
import { GiftController } from './gift.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Gift, GiftSchema } from './schemas/gift.schema';
import { DiscountModule } from '../discount/discount.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gift.name, schema: GiftSchema }]),
    DiscountModule,
  ],
  controllers: [GiftController],
  providers: [GiftService],
  exports: [GiftService, MongooseModule],
})
export class GiftModule {}
