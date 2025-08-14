import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateStatusCourseDto {
  @ApiProperty({
    description: 'New status for the courses',
    example: 'PUBLISHED',
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVE'],
  })
  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVE'])
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVE';
}
