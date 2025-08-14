import { IsMongoId } from 'class-validator';

export class UpdateStatusLessonParamsDto {
  @IsMongoId()
  id: string;
}
