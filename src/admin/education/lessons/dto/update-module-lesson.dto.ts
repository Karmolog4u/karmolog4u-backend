import { IsMongoId } from 'class-validator';

export class UpdateModuleLessonDto {
  @IsMongoId()
  moduleId: string;
}
