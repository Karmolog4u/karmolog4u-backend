import { IsMongoId } from 'class-validator';
export class UpdateModuleParamsDto {
  @IsMongoId()
  id: string;
}
