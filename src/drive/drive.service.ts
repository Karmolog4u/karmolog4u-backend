import { Inject, Injectable } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import { DRIVE_OPTIONS } from './constants';
import { DriveModuleOptions } from './drive.interfaces';

@Injectable()
export class DriveService {
  private drive: drive_v3.Drive;
  private folderId?: string;

  constructor(
    @Inject(DRIVE_OPTIONS)
    private readonly options: DriveModuleOptions,
  ) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: options.clientEmail,
        private_key: options.privateKey,
      },
      scopes: options.scopes || [
        'https://www.googleapis.com/auth/drive.readonly',
      ],
    });

    this.drive = google.drive({
      version: 'v3',
      auth,
    });
    this.folderId = options.folderId;
  }

  /**
   * Пошук файлу по назві
   */
  async findFileByName(name: string) {
    const query = `
          name='${name}'
          and '${this.folderId}' in parents
          and trashed=false
        `;
    const res = await this.drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size)',
      //   spaces: 'drive',
    });

    return res.data.files?.[0] || null;
  }

  /**
   * Отримати stream для скачування
   */
  async downloadFile(name: string): Promise<{
    stream: Readable;

    mimeType?: string;
  }> {
    const file = await this.findFileByName(name);
    console.log(file);

    if (!file) {
      throw new Error(`File not found: ${name}`);
    }

    const fileId = file.id!;
    const response = await this.drive.files.get(
      {
        fileId,
        alt: 'media',
      },
      { responseType: 'stream' },
    );

    return {
      stream: response.data as Readable,
      mimeType: file.mimeType,
    };
  }

  /**
   * Отримати список файлів
   */
  async listFiles(folderId?: string) {
    const query = folderId
      ? `'${folderId}' in parents and trashed=false`
      : 'trashed=false';

    const res = await this.drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType)',
    });

    return res.data.files;
  }
}
