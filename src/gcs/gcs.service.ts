import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { GCS_OPTIONS } from './constants';
import { GcsModuleOptions } from './gcs.interfaces';

@Injectable()
export class GcsService {
  private storage: Storage;
  private bucket;

  constructor(@Inject(GCS_OPTIONS) private readonly options: GcsModuleOptions) {
    this.storage = new Storage({
      projectId: options.projectId,
      credentials: options.credentials,
    });

    this.bucket = this.storage.bucket(options.bucket);
  }

  async findFileByName(fileName: string): Promise<string | null> {
    try {
      console.log(
        `Searching for file: ${fileName} in bucket: ${this.options.bucket}`,
      );
      const [files] = await this.bucket.getFiles({
        prefix: fileName,
      });

      const found = files.find((file) => {
        return file.name.endsWith(fileName);
      });

      if (!found) {
        console.log(`File not found: ${fileName}`);
        return null;
      }

      console.log(`File found: ${found.name}`);
      return found.name; // повний шлях у bucket
    } catch (error) {
      console.error(`Error searching for file: ${error.message}`);
      throw error;
    }
  }

  // async getFileStream(fileName: string) {
  //   const path = await this.findFileByName(fileName);
  //   // шукаємо по повному імені або в будь-якій "папці"
  //   const [files] = await this.bucket.getFiles({
  //     prefix: fileName,
  //   });

  //   const found = files.find((file) => {
  //     return file.name.endsWith(fileName);
  //   });

  //   if (!found) {
  //     return null;
  //   }

  //   return found.name; // повний шлях у bucket
  // }

  async getFileStream(fileName: string) {
    console.log(`Searching for file: ${fileName}`);
    console.log(`Bucket: ${this.options.bucket}`);
    const path = await this.findFileByName(fileName);
    console.log(`Found file path: ${path}`);
    if (!path) {
      throw new NotFoundException('File not found');
    }

    const file = this.bucket.file(path);

    const [exists] = await file.exists();

    if (!exists) {
      throw new NotFoundException('File not found');
    }

    return {
      stream: file.createReadStream(),
      metadata: file.metadata,
      name: path,
    };
  }
}
