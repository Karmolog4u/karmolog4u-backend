import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lstat, readdir, rmdir, unlink } from 'fs/promises';
import * as path from 'path';

const MIN_FILE_AGE_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class TemporaryUploadsCleanupService {
  private readonly logger = new Logger(TemporaryUploadsCleanupService.name);

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanTemporaryUploads(): Promise<void> {
    const directories = ['temporaryCovers', 'temporaryFiles'];

    for (const directory of directories) {
      const directoryPath = path.join(process.cwd(), directory);

      try {
        const deletedCount = await this.cleanDirectory(directoryPath);
        this.logger.log(
          `Deleted ${deletedCount} files older than 1 day from ${directoryPath}`,
        );
      } catch (error) {
        this.logger.error(`Failed to clean ${directoryPath}`, error);
      }
    }
  }

  private async cleanDirectory(directoryPath: string): Promise<number> {
    const entries = await readdir(directoryPath, { withFileTypes: true });
    const cutoffTime = Date.now() - MIN_FILE_AGE_MS;
    let deletedCount = 0;

    for (const entry of entries) {
      const entryPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        deletedCount += await this.cleanDirectory(entryPath);
        const remainingEntries = await readdir(entryPath);
        if (remainingEntries.length === 0) {
          await rmdir(entryPath);
        }
        continue;
      }

      const fileStats = await lstat(entryPath);
      if (fileStats.birthtimeMs < cutoffTime) {
        await unlink(entryPath);
        deletedCount += 1;
      }
    }

    return deletedCount;
  }
}
