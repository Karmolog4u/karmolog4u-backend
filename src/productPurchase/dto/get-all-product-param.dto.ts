import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class GetAllProductParam {
  @ApiProperty({
    description: 'Тип продукту',
    enum: ['Meditations', 'Webinars', 'GuidesAndBooks'],
    example: 'Meditations',
  })
  @IsEnum(['Meditations', 'Webinars', 'GuidesAndBooks'], {
    message: 'type має бути одним з: Meditations, Webinars, GuidesAndBooks',
  })
  type: 'Meditations' | 'Webinars' | 'GuidesAndBooks';
}
