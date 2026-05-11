import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SignDto {
  @ApiProperty({
    example: 'Ivan Petrenko',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Identification code',
  })
  @IsString()
  @IsNotEmpty()
  idCode: string;

  @ApiProperty({
    example: 'AB123456',
    description: 'Passport series and number',
  })
  @IsString()
  @IsNotEmpty()
  passportData: string;

  @ApiProperty({
    example: '+380501234567',
    description: 'Phone number',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'telegram:@ivan_petrenko',
    description: 'Messenger contact',
  })
  @IsString()
  @IsNotEmpty()
  messenger: string;
}
