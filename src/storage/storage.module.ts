import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { Module } from '@nestjs/common';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
