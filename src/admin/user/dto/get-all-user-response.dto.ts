import { ApiProperty } from '@nestjs/swagger';

export class GetAllUsersResponseItemDto {
  @ApiProperty({ example: 'Іван' })
  name: string;

  @ApiProperty({ example: 'Петренко' })
  lastName: string;

  @ApiProperty({ example: '0967788777' })
  mobPhone: string;

  @ApiProperty({ example: 'ivan.petrenko@gmail.com' })
  email: string;

  @ApiProperty({ example: false })
  banned: boolean;

  @ApiProperty({ example: true })
  verified: boolean;

  @ApiProperty({
    example: '2025-07-24T15:22:41.669Z',
    nullable: true,
  })
  lastLogin: string | null;

  @ApiProperty({
    example: '2025-07-24T15:21:54.476Z',
  })
  createdAt: string;

  @ApiProperty({
    example: '68824f9288e895de6ba6c570',
  })
  id: string;
}

export class GetAllUsersResponseDto {
  @ApiProperty({
    type: [GetAllUsersResponseItemDto],
  })
  data: GetAllUsersResponseItemDto[];

  @ApiProperty({
    example: 6,
    description: 'Загальна кількість користувачів (для пагінації)',
  })
  total: number;
}
