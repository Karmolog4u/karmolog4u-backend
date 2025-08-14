import { ApiProperty } from '@nestjs/swagger';

export class AccessDto {
  @ApiProperty({ type: String, format: 'date-time' })
  dateStart: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  dateEnd: Date;
}

class ModuleItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty({ type: AccessDto })
  access: AccessDto;
}
export class GetAllModuleResponseDto {
  @ApiProperty({ type: [ModuleItemDto] })
  data: ModuleItemDto[];

  @ApiProperty()
  totalPages: number;
}
