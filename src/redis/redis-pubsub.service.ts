import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisPubSubService implements OnModuleDestroy {
  private pub: Redis;
  private sub: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.getOrThrow<string>('REDIS_URL');

    this.pub = new Redis(redisUrl);
    this.sub = new Redis(redisUrl);
  }

  async publish(channel: string, data: unknown) {
    await this.pub.publish(channel, JSON.stringify(data));
  }

  async subscribe(
    channel: string,
    handler: (data: any) => void,
  ): Promise<() => Promise<void>> {
    const listener = (receivedChannel: string, message: string) => {
      if (receivedChannel !== channel) return;
      handler(JSON.parse(message));
    };

    this.sub.on('message', listener);
    await this.sub.subscribe(channel);

    return async () => {
      this.sub.off('message', listener);
      await this.sub.unsubscribe(channel);
    };
  }

  async onModuleDestroy() {
    await this.pub.quit();
    await this.sub.quit();
  }
}
