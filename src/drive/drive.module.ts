import { DynamicModule, Module, Global } from '@nestjs/common';
import { DriveService } from './drive.service';
import { DriveModuleOptions } from './drive.interfaces';
import { DRIVE_OPTIONS } from './constants';

@Global()
@Module({})
export class DriveModule {
  static forRootAsync(options: {
    useFactory: (
      ...args: any[]
    ) => Promise<DriveModuleOptions> | DriveModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: DriveModule,
      providers: [
        {
          provide: DRIVE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        DriveService,
      ],
      exports: [DriveService],
    };
  }
}
