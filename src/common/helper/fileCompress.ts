import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { fileDelete } from './fileDelete';
import * as path from 'path';
import * as fs from 'fs/promises';

export const fileCompress = async (
  file: any,
  configService: ConfigService,
  newPath = 'covers',
) => {
  try {
    const rootFolder = path.join(process.cwd(), '..', 'storage', newPath);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [name, extension] = file.filename.split('.');
    // const outputDir = path.join(__dirname, '..', '..', '..'/, 'covers');
    // const compressedPath = path.join(outputDir, `${name}.webp`);
    const compressedPath = `${rootFolder}/${name}.webp`;

    try {
      await sharp(file.path)
        .resize(800) // Змінює ширину до 800 пікселів, зберігаючи співвідношення сторін
        .webp({ quality: 75 }) // Конвертує в JPEG з якістю 70%
        .toFile(compressedPath); // Зберігає файл
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
    // Стиснення зображення

    // delete from temporary folder
    await fileDelete(file.path);

    //crate link for image
    const envValue = configService.get<string>('SERVER_IP');
    const coverPath = path.join('covers', `${name}.webp`);
    return `${envValue}${coverPath}`;
  } catch (error) {
    throw new HttpException(
      {
        status: error.status,
        message: error.response.message,
        error: error.response.error,
      },
      error.status,
      {
        cause: error,
      },
    );
  }
};
