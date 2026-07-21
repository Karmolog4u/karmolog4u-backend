import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export function StringField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty(options),
    IsString(),
    IsNotEmpty(),
    MaxLength(1000),
  );
}
