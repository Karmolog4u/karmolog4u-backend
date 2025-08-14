import { ApiProperty } from '@nestjs/swagger';

export class GetUserByIdDto {
  @ApiProperty({
    example: '68824f9288e895de6ba6c570',
    description: 'Унікальний ідентифікатор користувача (MongoDB ObjectId)',
  })
  id: string;

  @ApiProperty({
    example: 'Іван',
    description: "Ім'я користувача",
  })
  name: string;

  @ApiProperty({
    example: 'Петренко',
    description: 'Прізвище користувача',
  })
  lastName: string;

  @ApiProperty({
    example: '0967788777',
    description: 'Номер мобільного телефону',
  })
  mobPhone: string;

  @ApiProperty({
    example: 'ivan.petrenko@gmail.com',
    description: 'Email користувача',
  })
  email: string;

  @ApiProperty({
    example: false,
    description: 'Чи заблокований користувач (banned)',
  })
  banned: boolean;

  @ApiProperty({
    example: true,
    description: 'Чи верифікований користувач (verified)',
  })
  verified: boolean;

  @ApiProperty({
    example: 'ADMIN',
    enum: ['ADMIN', 'USER'],
    description: 'Роль користувача',
  })
  role: string;

  @ApiProperty({
    example: '2025-07-24T15:22:41.669Z',
    description: 'Останній вхід користувача (lastLogin)',
  })
  lastLogin: string | null;

  @ApiProperty({
    example: '2025-07-24T15:21:54.476Z',
    description: 'Дата створення користувача (createdAt)',
  })
  createdAt: string;
}
