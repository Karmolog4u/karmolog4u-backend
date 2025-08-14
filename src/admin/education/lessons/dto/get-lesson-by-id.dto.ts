import { IsMongoId } from 'class-validator';

export class GetByIdLessonParams {
  @IsMongoId()
  id: string;
}
