import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class PurchaseIdDto {
  @ApiProperty({
    description: 'ID курсу',
    example: '64a872bd92c1d5412830c9a1',
  })
  @IsMongoId({ message: 'courseId має бути дійсним MongoID' })
  purchaseId: string;
}
