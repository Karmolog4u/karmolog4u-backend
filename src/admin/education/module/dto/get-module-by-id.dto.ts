import { ApiProperty } from '@nestjs/swagger';

class AccessDto {
  @ApiProperty({ type: String, format: 'date-time' })
  dateStart: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  dateEnd: Date;
}
export class GetModuleByIdResponseDto {
  @ApiProperty({ example: 'Module 1' })
  name: string;

  @ApiProperty({ example: 'video' })
  type: string;

  @ApiProperty({ type: AccessDto })
  access: AccessDto;

  @ApiProperty({ example: '30' })
  durationInDays: string;
}
