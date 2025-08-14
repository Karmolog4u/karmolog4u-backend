import { IsMongoId } from 'class-validator';

export class GetAllLessonParams {
  @IsMongoId()
  id: string;
}
