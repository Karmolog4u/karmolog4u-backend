import { ApiProperty } from '@nestjs/swagger';
// import { Types } from 'mongoose';

class AccessDto {
  @ApiProperty({
    example: 'PERMANENT',
    enum: ['PERMANENT', 'FOR_PERIOD', 'TO_DATE'],
  })
  type: string;

  @ApiProperty({ example: '2025-03-10T17:20:14.504+00:00' })
  dateStart: Date;

  @ApiProperty({ example: '2025-03-10T17:20:14.504+00:00' })
  dateEnd: Date;
}

class LiteratureDto {
  @ApiProperty({ example: 'John Doe' })
  author: string;

  @ApiProperty({ example: 'https://example.com/book.pdf' })
  link: string;
}

class ContractPointDto {
  @ApiProperty({ example: 'Important Clause' })
  name: string;

  @ApiProperty({ example: 'Description of the contract point' })
  description: string;
}

class ContractDto {
  @ApiProperty({ example: '2025-05-01T10:00:00.000Z' })
  date: Date;

  @ApiProperty({ example: '2025-06-01T23:59:59.000Z' })
  signUpTo: Date;

  @ApiProperty({ example: 1000 })
  price: number;

  @ApiProperty({ example: 'Premium Course Contract' })
  header: string;

  @ApiProperty({ type: [ContractPointDto] })
  points: ContractPointDto[];
}

class OptionalLinkDto {
  @ApiProperty({
    description: 'Назва посилання',
    example: 'Документація',
  })
  name: string;

  @ApiProperty({
    description: 'URL посилання',
    example: 'https://example.com/doc',
  })
  link: string;
}

export class GetCourseByIdDto {
  @ApiProperty({ example: 'Advanced JavaScript' })
  name: string;

  @ApiProperty({
    example: 'SSK_WITH_CURATOR',
    enum: [
      'SSK_INDEPENDENT',
      'SSK_WITH_CURATOR',
      'SSK_WITH_SERGIY',
      'ADVANCED',
      'CONSULTING',
    ],
  })
  type: string;

  @ApiProperty({ example: 'ALL', enum: ['ALL', 'BY_LESSON'] })
  completeness: string;

  @ApiProperty({ type: AccessDto })
  access: AccessDto;

  @ApiProperty({ type: ContractDto })
  contract: ContractDto;

  @ApiProperty({ example: 'some-chat-id' })
  chat: string;

  @ApiProperty({ type: OptionalLinkDto })
  optionalLink: OptionalLinkDto[];

  @ApiProperty({ example: ['file1.pdf', 'file2.docx'] })
  optionalFiles: string[];

  @ApiProperty({ example: 123 })
  practiceInvoice: number;

  @ApiProperty({ example: 1 })
  stream: number;

  @ApiProperty({ example: 500 })
  price: number;

  @ApiProperty({ type: [LiteratureDto] })
  literature: LiteratureDto[];

  @ApiProperty({ example: 'https://example.com/cover.jpg' })
  cover: string;

  @ApiProperty({
    example: 'PUBLISHED',
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVE'],
  })
  status: string;
}
