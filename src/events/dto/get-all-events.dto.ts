import { ApiProperty } from '@nestjs/swagger';

export class GetAllEventsDto {
  @ApiProperty({
    description: 'Start date for the event',
    example: '2026.05.04',
  })
  from: string;

  @ApiProperty({
    description: 'End date for the event',
    example: '2026.05.06',
  })
  to: string;
}
