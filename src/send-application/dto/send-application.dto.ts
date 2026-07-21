import { IsEmail, IsPhoneNumber, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StringField } from 'src/common/decorators/string-field.decorator';

export class CreateAssociationApplicationDto {
  @StringField({
    example: 'Іваненко Іван Іванович',
  })
  name: string;

  @StringField({
    example: 'Ivanenko Ivan Ivanovych',
  })
  nameEng: string;

  @ApiProperty({
    example: '1995-03-25',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be YYYY-MM-DD',
  })
  date: string;

  @ApiProperty({
    example: '+380671234567',
  })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    example: 'user@gmail.com',
  })
  @IsEmail()
  email: string;

  @StringField()
  socLink: string;

  @StringField()
  education: string;

  @StringField()
  educationInStudio: string;

  @StringField()
  courses: string;

  @StringField()
  graduateSchool: string;

  @StringField()
  work: string;

  @StringField()
  interesting: string;

  @StringField()
  otherMemberships: string;

  @StringField({
    example: 'Моя мотивація...',
  })
  motivation: string;

  @StringField({ example: 'Наберіть мене після 19' })
  comment: string;
}
