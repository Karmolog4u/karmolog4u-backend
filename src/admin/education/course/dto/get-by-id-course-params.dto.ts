import { IsMongoId } from 'class-validator';

export class GetByIdCourseParams {
  @IsMongoId()
  id: string;
}
