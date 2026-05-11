import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'New event', description: 'Event name' })
  @IsString()
  name: string;

  @ApiProperty({
    example: '2025-06-01T00:00:00.000Z',
    description: 'Event start date',
  })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  dateStart: Date;

  @ApiProperty({
    example: '2025-06-30T23:59:59.000Z',
    description: 'Event end date',
  })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  dateEnd: Date;

  @ApiPropertyOptional({
    example: 'https://example.com/cover.jpg',
    description: 'Cover image URL',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? encodeURI(value) : value,
  )
  @IsUrl(
    {
      require_tld: false, // ❗ дозволити локальні домени типу localhost
      require_protocol: true,
      protocols: ['http', 'https'],
    },
    { message: 'Cover must be a valid URL' },
  )
  cover: string;

  @ApiProperty({
    example: 'https://example.com/event',
    description: 'Event link',
  })
  @IsUrl()
  eventLink: string;

  @ApiProperty({
    example: 'PUBLISHED',
    description: 'Event status',
  })
  @IsEnum(['PUBLISHED', 'DRAFT'])
  status: string;
}
