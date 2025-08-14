import { ApiProperty } from '@nestjs/swagger';

export class DownloadExcelFileDto {
  @ApiProperty({
    description: 'The binary content of the Excel file',
    type: 'string',
    format: 'binary',
  })
  file: any;
}
