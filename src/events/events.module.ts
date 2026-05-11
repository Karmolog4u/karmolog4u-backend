import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from 'src/admin/events/schemas/event.shema';
import { EventsController } from './events.controller';
import { EventsServices } from './event.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  ],
  controllers: [EventsController],
  providers: [EventsServices],
})
export class EventsModule {}
