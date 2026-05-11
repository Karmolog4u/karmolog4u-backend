import { ApiProperty } from '@nestjs/swagger';

class EventDto {
  @ApiProperty({ example: 'New event' })
  name: string;

  @ApiProperty({ example: '2025-06-01T00:00:00.000Z' })
  dateStart: Date;

  @ApiProperty({ example: '2025-06-30T23:59:59.000Z' })
  dateEnd: Date;

  @ApiProperty({ example: 'https://example.com/event' })
  eventLink: string;
  @ApiProperty({ example: 'PUBLISHED' })
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVE';
}

export class GetAllEventsReDto {
  @ApiProperty({ type: [EventDto] })
  data: EventDto[];

  @ApiProperty({ example: { PUBLISHED: 10, DRAFT: 5, ARCHIVE: 3 } })
  count: {
    PUBLISHED: number;
    DRAFT: number;
    ARCHIVE: number;
  };
}
