import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class UserIdParamDto {
  @ApiProperty({
    description: 'ID користувача',
    example: '64a872bd92c1d5412830c9a0',
  })
  @IsMongoId({ message: 'userId має бути дійсним MongoID' })
  userId: string;
}
