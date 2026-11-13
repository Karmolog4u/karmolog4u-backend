import { ApiProperty } from '@nestjs/swagger';
import { Status } from 'src/products/meditations/schemas/meditation.schema';

export class ChangeStatusMeditationDto {
  @ApiProperty({
    enum: Status,
    enumName: 'Status',
    description: 'Status of the meditation',
    example: Status.PUBLISHED,
    required: true,
  })
  status: Status;
}
