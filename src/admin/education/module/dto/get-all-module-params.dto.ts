import { IsMongoId } from 'class-validator';

export class GetAllModuleParams {
  @IsMongoId()
  id: string;
}
