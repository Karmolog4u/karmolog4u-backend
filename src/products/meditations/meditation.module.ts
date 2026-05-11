import { Module } from '@nestjs/common';
import { MeditationController } from './meditation.controller';
import { MeditationService } from './meditation.service';
import { Meditation, MeditationSchema } from './schemas/meditation.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Meditation.name, schema: MeditationSchema },
    ]),
  ],
  controllers: [MeditationController],
  providers: [MeditationService],
  exports: [MeditationModule, MongooseModule],
})
export class MeditationModule {}
