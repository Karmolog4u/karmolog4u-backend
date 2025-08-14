import { ApiProperty } from '@nestjs/swagger';

class AccessDto {
  @ApiProperty({ example: 'PERMANENT' })
  type: string;

  @ApiProperty({ example: '2025-03-10T17:20:14.504+00:00' })
  dateStart: string;

  @ApiProperty({ example: '2025-03-10T17:20:14.504+00:00' })
  dateEnd: string;
}

class CourseDto {
  @ApiProperty({ example: 'Advanced JavaScript' })
  name: string;

  @ApiProperty({ example: 'SSK_WITH_CURATOR' })
  type: string;

  @ApiProperty({ example: 'ALL' })
  completeness: string;

  @ApiProperty({ type: AccessDto })
  access: AccessDto;

  @ApiProperty({ example: '1' })
  stream: string;

  @ApiProperty({ example: '681296fdaba55f9290ab6237' })
  id: string;
}

export class GetAllCourseResponseDto {
  @ApiProperty({ type: [CourseDto] })
  data: CourseDto[];

  @ApiProperty({ example: 2 })
  totalPages: number;
}
