import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsMongoId,
  // IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TargetModule {
  WEBINARS = 'Webinars',
  MEDITATIONS = 'Meditations',
  GUIDES_AND_BOOKS = 'GuidesAndBooks',
}

export class ProductDto {
  @ApiProperty({
    description: 'ID продукту',
    example: '64a872bd92c1d5412830c9a1',
  })
  @IsMongoId({ message: 'productId має бути дійсним MongoID' })
  productId: string;

  @ApiProperty({
    description: 'Модуль, до якого належить продукт',
    enum: TargetModule,
    example: TargetModule.MEDITATIONS,
  })
  // @IsEnum(TargetModule, {
  //   message: `targetModule має бути одним із: ${Object.values(
  //     TargetModule,
  //   ).join(', ')}`,
  // })
  targetModule: TargetModule;
}

export class AddProductsDto {
  @ApiProperty({
    description: 'Список продуктів',
    type: [ProductDto],
    example: [
      { productId: '64a872bd92c1d5412830c9a1', targetModule: 'Meditations' },
      { productId: '64a872bd92c1d5412830c9a2', targetModule: 'Webinars' },
    ],
  })
  @IsArray({ message: 'products має бути масивом' })
  @ArrayNotEmpty({ message: 'products не може бути порожнім' })
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];
}
