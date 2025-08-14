import { ApiProperty } from '@nestjs/swagger';

export class ResponseSuccessDto {
  @ApiProperty({
    type: String,
    description: 'Success message response',
    example: 'success',
    required: true,
  })
  message: string;
}
