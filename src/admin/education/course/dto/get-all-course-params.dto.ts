import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class GetAllCourseParams {
  @ApiProperty({
    description: 'Course status',
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVE'],
    example: 'DRAFT',
  })
  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVE'])
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVE';
}
