import { ApiPropertyOptional } from '@nestjs/swagger';

export class AccessDto {
  @ApiPropertyOptional({ type: String, format: 'date-time' })
  dateStart?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  dateEnd?: Date;
}

export class UpdateModuleDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional({ type: AccessDto })
  access?: AccessDto;

  @ApiPropertyOptional()
  durationInDays?: string;
}
