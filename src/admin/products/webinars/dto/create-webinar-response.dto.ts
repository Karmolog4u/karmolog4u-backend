import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWebinarResponseDto {
  @ApiProperty({
    type: String,
    description: 'Success message',
    example: 'success',
  })
  message: string;

  @ApiPropertyOptional({
    type: String,
    description: 'URL of the uploaded cover image',
    example: 'http://localhost:3010/covers/image.webp',
  })
  cover?: string;
}
