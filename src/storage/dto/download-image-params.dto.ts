import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DownloadImageParamsDto {
  @ApiProperty({
    description: 'Name of the image file',
    example: 'profile-picture.jpg',
  })
  @IsString()
  imageName: string;
}
