import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class ProductIdParamDto {
  @ApiProperty({
    description: 'ID продукту (Webinar, Meditation або GuidesAndBooks)',
    example: '64a872bd92c1d5412830c9a1',
  })
  @IsMongoId({ message: 'productId має бути дійсним MongoID' })
  productId: string;
}
