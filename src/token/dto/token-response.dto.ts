import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    type: String,
    description: 'Access token to access data, expires in 1d',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.....',
    required: true,
  })
  accessToken: string;
  @ApiProperty({
    type: String,
    description: 'Refresh token to update access, expires in 30d',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.....',
    required: true,
  })
  refreshToken: string;
}
