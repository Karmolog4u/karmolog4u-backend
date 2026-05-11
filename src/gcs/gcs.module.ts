import { DynamicModule, Module, Global } from '@nestjs/common';
import { GcsModuleOptions } from './gcs.interfaces';
import { GcsService } from './gcs.service';
import { GCS_OPTIONS } from './constants';

@Global()
@Module({})
export class GcsModule {
  static forRootAsync(options: {
    useFactory: (
      ...args: any[]
    ) => Promise<GcsModuleOptions> | GcsModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: GcsModule,
      providers: [
        {
          provide: GCS_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        GcsService,
      ],
      exports: [GcsService],
    };
  }
}
