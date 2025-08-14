import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, ArrayNotEmpty } from 'class-validator';

export class ArrayUserIdsDto {
  @ApiProperty({
    description: 'Масив ID користувачів (MongoDB ObjectId)',
    type: [String],
    example: [
      '68824f9288e895de6ba6c570',
      '68801940ba5a6ca42488644e',
      '687ac075e56c0fa2e9ea088b',
    ],
  })
  @IsArray({ message: 'Поле users повинно бути масивом' })
  @ArrayNotEmpty({ message: 'Масив users не повинен бути порожнім' })
  @IsMongoId({
    each: true,
    message: 'Кожен елемент в users має бути валідним MongoID',
  })
  users: string[];
}
