import { ApiProperty } from '@nestjs/swagger';

export class ProductListItemDto {
  @ApiProperty({
    description: 'ID продукту',
    example: '68757a60533192dd222d82a0',
  })
  id: string;

  @ApiProperty({
    description: 'Назва продукту українською',
    example: 'Свічка',
  })
  name: string;
}

export class ProductListResponseDto {
  @ApiProperty({
    description: 'Список продуктів для селекту',
    type: [ProductListItemDto],
  })
  list: ProductListItemDto[];
}
