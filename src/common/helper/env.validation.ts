import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  Max,
  Min,
  validateSync,
  IsString,
  IsDefined,
  IsNotEmpty,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  MONGO_URL: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;

  @IsDefined()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    console.error('Environment validation errors:', errors);
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
