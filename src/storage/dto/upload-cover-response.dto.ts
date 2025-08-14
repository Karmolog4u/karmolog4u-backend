import { ApiProperty } from '@nestjs/swagger';

export class UploadCoverResponseDto {
  @ApiProperty({
    description: 'URL of the uploaded Cover',
    example: 'https://example.com/uploads/image.jpg',
  })
  link: string;
}
