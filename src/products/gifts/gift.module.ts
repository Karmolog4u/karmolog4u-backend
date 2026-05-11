import { GiftController } from './gift.controller';
import { GiftService } from './gift.service';
import { GiftModule as AdminGiftModule } from 'src/admin/products/gift/gift.module';

import { Module } from '@nestjs/common';

@Module({
  imports: [AdminGiftModule],
  controllers: [GiftController],
  providers: [GiftService],
})
export class GiftModule {}
