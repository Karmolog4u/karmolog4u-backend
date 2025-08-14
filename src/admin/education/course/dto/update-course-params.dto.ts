import { IsMongoId } from 'class-validator';

export class UpdateCourseParamsDto {
  @IsMongoId()
  id: string;
}
