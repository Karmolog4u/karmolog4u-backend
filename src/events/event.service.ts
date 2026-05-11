import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from 'src/admin/events/schemas/event.shema';
import { GetAllEventsDto } from './dto/get-all-events.dto';

@Injectable()
export class EventsServices {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {}
  async getAllEvents(dates: GetAllEventsDto) {
    const { from, to } = dates;
    if (!from || !to) {
      throw new BadRequestException('Вкажіть коректні дати');
    }
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const now = new Date();

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Некоректний формат дат');
    }

    const effectiveFrom = fromDate > now ? fromDate : now;
    const events = await this.eventModel
      .find(
        {
          dateStart: { $gte: effectiveFrom },
          dateEnd: { $lte: toDate },
          status: 'PUBLISHED',
        },
        { dateStart: 1, name: 1, cover: 1 },
      )
      .sort({ dateStart: 1 });
    return events;
  }
}
