import { IsMongoId } from 'class-validator';

export class UpdateLessonParamsDto {
  @IsMongoId()
  id: string;
}
