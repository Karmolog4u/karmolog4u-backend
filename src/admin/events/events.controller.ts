import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from 'src/role/role.enum';
import { Roles } from 'src/role/roles.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';
import { GetAllEventsDto } from './dto/get-all-events.dto';
import { GetAllEventsReDto } from './dto/get-all-events-re.dto';
import { DeleteEventsDto } from './dto/delete-events.dto';

@ApiBearerAuth()
@ApiTags('admin-events')
@Roles(Role.Admin)
@Controller('admin/events')
export class EventsController {
  constructor(private eventService: EventsService) {}
  @Post('create')
  @ApiOperation({
    summary: 'Admin Create event',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    description: 'Events data',
    type: CreateEventDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Успішно',
  })
  @ApiResponse({ status: 400, description: 'Помилка створення події' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено' })
  async createEventController(@Body() event: CreateEventDto) {
    await this.eventService.createEvent(event);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Admin Get all events',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    description: 'Events query',
    type: GetAllEventsDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Успішно',
    type: GetAllEventsReDto,
  })
  async getAllEvents(@Query() query: GetAllEventsDto) {
    return await this.eventService.getAllEvents(query);
  }
  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin Delete events',
    description: 'Access restricted to admins',
  })
  @ApiBody({
    description: 'Events IDs to delete',
    type: DeleteEventsDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Успішно',
  })
  @ApiResponse({ status: 400, description: 'Помилка видалення подій' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено' })
  async deleteEvents(@Body() eventIds: DeleteEventsDto) {
    return await this.eventService.deleteEvents(eventIds.ids);
  }
  @Get('get/:id')
  @ApiOperation({
    summary: 'Admin Get event by ID',
    description: 'Access restricted to admins',
  })
  @ApiParam({
    name: 'id',
    description: 'Event ID',
    example: '64a7f0c2e1b2c3d4e5f67890',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Успішно',
  })
  @ApiResponse({ status: 404, description: 'Подію не знайдено' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено' })
  async getEventById(@Param('id') id: string) {
    return await this.eventService.getEventById(id);
  }
  @Put('update/:id')
  @ApiOperation({
    summary: 'Admin Update event by ID',
    description: 'Access restricted to admins',
  })
  @ApiParam({
    name: 'id',
    description: 'Event ID',
    example: '64a7f0c2e1b2c3d4e5f67890',
    type: String,
  })
  @ApiBody({
    description: 'Event data to update',
    type: CreateEventDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Успішно',
  })
  @ApiResponse({ status: 404, description: 'Подію не знайдено' })
  @ApiResponse({ status: 403, description: 'Доступ заборонено' })
  async updateEvent(@Param('id') id: string, @Body() event: CreateEventDto) {
    return await this.eventService.updateEvent(id, event);
  }
}
