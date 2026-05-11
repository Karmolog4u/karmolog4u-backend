import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsMongoId } from 'class-validator';

export class DeleteEventsDto {
  @ApiProperty({
    example: ['60d21b4667d0d8992e610c85', '60d21b4967d0d8992e610c86'],
    description: 'Array of event IDs to delete',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  ids: string[];
}
