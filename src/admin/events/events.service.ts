import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './schemas/event.shema';
import { Model, Types } from 'mongoose';
import { GetAllEventsDto } from './dto/get-all-events.dto';
import { getFileNameFromUrl } from 'src/common/helper/getFileNameFromUrl';
import { StorageService } from 'src/storage/storage.service';
import { coverCompress } from 'src/common/helper/coverCompress';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}
  async createEvent(data: CreateEventDto) {
    try {
      const { cover } = data;
      if (cover) {
        //get name from url
        const coverName = getFileNameFromUrl(cover);
        //check exist
        const fileExist = await this.storageService.coverExists(
          this.storageService.getTempCoversFolder(),
          coverName,
        );

        if (fileExist) {
          const coversPath = path.join(
            process.cwd(),
            '..',
            'storage',
            'covers',
          );
          const coverLink = await coverCompress(
            cover,
            coversPath,
            this.configService,
          );

          data.cover = coverLink;
        } else {
          data.cover = '';
        }
      }
      const newEvent = await this.eventModel.create(data);
      return newEvent;
    } catch (error) {
      throw new InternalServerErrorException('Помилка створення події');
    }
  }
  async getAllEvents(query: GetAllEventsDto) {
    const { page = 1, limit = 20, search = '', status } = query;
    const skip = (page - 1) * limit;
    const now = new Date();
    const statusFilter =
      status === 'ARCHIVE'
        ? { dateEnd: { $lt: now } }
        : { status: status, dateEnd: { $gt: now } };
    const events = await this.eventModel
      .find(
        { name: { $regex: search, $options: 'i' }, ...statusFilter },
        { createdAt: 0, updatedAt: 0, cover: 0 },
      )
      .skip(skip)
      .limit(limit);
    const count = await this.getEventsCount();
    return { data: events, count };
  }
  async getEventsCount() {
    const now = new Date();
    const result = await this.eventModel.aggregate([
      {
        $facet: {
          PUBLISHED: [
            {
              $match: {
                status: 'PUBLISHED',
                dateEnd: { $gt: now },
              },
            },
            { $count: 'count' },
          ],

          DRAFT: [
            {
              $match: {
                status: 'DRAFT',
                dateEnd: { $gt: now },
              },
            },
            { $count: 'count' },
          ],

          ARCHIVE: [
            {
              $match: {
                dateEnd: { $lt: now },
              },
            },
            { $count: 'count' },
          ],
        },
      },
    ]);
    const raw = result[0];
    return {
      PUBLISHED: raw.PUBLISHED[0] ? raw.PUBLISHED[0].count : 0,
      DRAFT: raw.DRAFT[0] ? raw.DRAFT[0].count : 0,
      ARCHIVE: raw.ARCHIVE[0] ? raw.ARCHIVE[0].count : 0,
    };
  }
  async deleteEvents(eventIds: string[]) {
    try {
      const events = await this.eventModel.find({
        _id: { $in: eventIds },
      });
      const coversToDelete = events
        .map((e) => ({ path: getFileNameFromUrl(e.cover) }))
        .filter((c) => c);
      const rootPath = path.join(process.cwd(), '..', 'storage', 'covers');

      await this.storageService.deleteFiles(rootPath, coversToDelete);

      await this.eventModel.deleteMany({
        _id: { $in: eventIds },
      });

      return { message: 'Події успішно видалені' };
    } catch (error) {
      throw new InternalServerErrorException('Помилка видалення подій');
    }
  }
  async getEventById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Подію не знайдено');
    }
    const event = await this.eventModel.findById(id, {
      createdAt: 0,
      updatedAt: 0,
    });
    if (!event) {
      throw new NotFoundException('Подію не знайдено');
    }
    return event;
  }
  async updateEvent(id: string, data: CreateEventDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Подію не знайдено');
    }
    const oldEvent = await this.eventModel.findById(id);
    if (!oldEvent) {
      throw new NotFoundException('Подію не знайдено');
    }
    if (data.cover && data.cover !== oldEvent.cover) {
      const rootPath = path.join(process.cwd(), '..', 'storage', 'covers');
      const oldCoverName = getFileNameFromUrl(oldEvent.cover);

      const coverName = getFileNameFromUrl(data.cover);
      //check exist
      const fileExist = await this.storageService.coverExists(
        this.storageService.getTempCoversFolder(),
        coverName,
      );
      if (fileExist) {
        const coversPath = path.join(process.cwd(), '..', 'storage', 'covers');
        const coverLink = await coverCompress(
          data.cover,
          coversPath,
          this.configService,
        );

        data.cover = coverLink;
        await this.storageService.deleteFiles(rootPath, [
          { path: oldCoverName },
        ]);
      } else {
        data.cover = oldEvent.cover;
      }
    }
    await this.eventModel.findByIdAndUpdate(id, data);
    return { message: 'Подію успішно оновлено' };
  }
}
