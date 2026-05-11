import { Module } from '@nestjs/common';
import { RedisPubSubService } from './redis-pubsub.service';

@Module({
  imports: [],
  controllers: [],
  providers: [RedisPubSubService],
  exports: [RedisPubSubService],
})
export class RedisPubsubModule {}
