import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId } from 'class-validator';

export class DeleteModuleDto {
  @ApiProperty({
    description: 'Array of module IDs to delete',
    type: [String],
    example: ['660f1c1e4f8b9b0012345678', '660f1c1e4f8b9b0098765432'],
  })
  @IsArray()
  @IsMongoId({ each: true }) // Ensures each item in the array is a valid MongoDB ObjectId
  moduleIds: string[];
}
