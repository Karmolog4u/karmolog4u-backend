import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class ActivateConsultingAdvancedDto {
  @ApiProperty({
    description: 'ID курсу, який потрібно активувати',
    example: '64a872bd92c1d5412830c9a1',
  })
  @IsMongoId({ message: 'courseId має бути валідним MongoID' })
  courseId: string;
}
