import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class UploadFilesDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Array of files to upload',
  })
  @IsNotEmpty()
  files: Express.Multer.File[];
}
