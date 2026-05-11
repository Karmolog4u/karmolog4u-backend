import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/role/role.enum';
import { Roles } from 'src/role/roles.decorator';
import { EventsServices } from './event.service';
import { GetAllEventsDto } from './dto/get-all-events.dto';

@ApiBearerAuth()
@ApiTags('user-events')
@Roles(Role.User)
@Controller('/user/events')
export class EventsController {
  constructor(private readonly eventsService: EventsServices) {}
  @Get('all')
  async getAllEvents(@Query() query: GetAllEventsDto) {
    return await this.eventsService.getAllEvents(query);
  }
}
