import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateStatusLessonDto {
  @ApiProperty({
    description: 'New status for the lesson',
    example: 'PUBLISHED',
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVE'],
  })
  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVE'])
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVE';
}
