import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { Module } from '@nestjs/common';
import { FilesModule } from 'src/files/files.module';
import { TemporaryUploadsCleanupService } from './temporary-uploads-cleanup.service';

@Module({
  imports: [FilesModule],
  controllers: [StorageController],
  providers: [StorageService, TemporaryUploadsCleanupService],
  exports: [StorageService],
})
export class StorageModule {}
