import { IsMongoId } from 'class-validator';
export class GetModuleByIdParams {
  @IsMongoId()
  id: string;
}
