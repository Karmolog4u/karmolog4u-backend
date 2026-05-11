import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLessonParamsDto {
  @ApiProperty({
    example: '6745d3b9f2a4c52b9c1a23ef',
    description: 'ID уроку (MongoDB ObjectId)',
  })
  @IsMongoId()
  id: string;
}
