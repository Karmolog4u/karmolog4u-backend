import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Поле для сортування',
    enum: [
      'name',
      'email',
      'createdAt',
      'lastLogin',
      'banned',
      'verified',
      'toDelete',
    ],
    example: 'email',
  })
  @IsOptional()
  @IsIn(
    [
      'name',
      'email',
      'createdAt',
      'lastLogin',
      'banned',
      'verified',
      'toDelete',
    ],
    {
      message:
        'sortBy має бути одним із: name, email, createdAt, lastLogin, banned, verified, toDelete',
    },
  )
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Порядок сортування: 1 — за зростанням, -1 — за спаданням',
    enum: [1, -1],
    example: -1,
  })
  @IsOptional()
  @IsIn([1, -1], {
    message: 'sortOrder може бути лише 1 (ASC) або -1 (DESC)',
  })
  @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Пошук по імені, прізвищу або email',
    example: 'ivan',
  })
  @IsOptional()
  @IsString({
    message: 'search має бути рядком',
  })
  searchQuery?: string;

  @ApiPropertyOptional({
    description: 'ID курсу для фільтрації користувачів, які придбали цей курс',
    example: '64ff00a7d81e29cbf3ac11f1',
  })
  @IsOptional()
  @IsMongoId({
    message: 'course_id має бути валідним MongoID',
  })
  course_id?: string;

  @ApiPropertyOptional({
    description: 'Номер сторінки (pagination)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'page має бути цілим числом',
  })
  page?: number;

  @ApiPropertyOptional({
    description: 'Кількість елементів на сторінку (pagination)',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'limit має бути цілим числом',
  })
  limit?: number;
}
