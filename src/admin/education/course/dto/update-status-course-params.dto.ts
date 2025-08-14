import { IsMongoId } from 'class-validator';

export class UpdateStatusCourseParamsDto {
  @IsMongoId()
  id: string;
}
