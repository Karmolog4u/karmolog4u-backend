import { ApiProperty } from '@nestjs/swagger';

export class CourseListItemDto {
  @ApiProperty({
    description: 'ID продукту',
    example: '68757a60533192dd222d82a0',
  })
  id: string;

  @ApiProperty({
    description: 'Назва продукту українською',
    example: 'Сам собі Кармолог',
  })
  name: string;
}

export class CourseListResponseDto {
  @ApiProperty({
    description: 'Список продуктів для селекту',
    type: [CourseListItemDto],
  })
  list: CourseListItemDto[];
}
