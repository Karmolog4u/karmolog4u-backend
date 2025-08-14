import { IsMongoId } from 'class-validator';

export class UpdateModuleLessonParamsDto {
  @IsMongoId()
  id: string;
}
