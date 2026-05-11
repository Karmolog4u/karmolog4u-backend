import { ApiProperty } from '@nestjs/swagger';

export class UserInfoResponseDto {
  @ApiProperty({ example: 'Іван', description: "Ім'я користувача" })
  name: string;

  @ApiProperty({ example: 'Петренко', description: 'Прізвище користувача' })
  lastName: string;

  @ApiProperty({ example: '+380967788777', description: 'Мобільний телефон' })
  mobPhone: string;

  @ApiProperty({
    example: 'ivan.petrenko@gmail.com',
    description: 'Email користувача',
  })
  email: string;

  @ApiProperty({
    example: 'https://example.com/cover.jpg',
    description: 'Посилання на обкладинку профілю',
    required: false,
  })
  cover?: string;
}
