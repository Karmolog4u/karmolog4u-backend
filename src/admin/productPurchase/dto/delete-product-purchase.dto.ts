import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class DeletePurchaseDto {
  @ApiProperty({
    description: 'ID покупки',
    example: '64a872bd92c1d5412830c9a9',
  })
  @IsMongoId({ message: 'purchaseId має бути валідним MongoID' })
  purchaseId: string;
}
