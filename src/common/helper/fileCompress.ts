import { ConfigService } from '@nestjs/config';

import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { fileDelete } from './fileDelete';
import * as path from 'path';
import sharp = require('sharp');

export const fileCompress = async (
  file: any,
  configService: ConfigService,
  newPath = 'covers',
) => {
  try {
    const rootFolder = path.join(process.cwd(), '..', 'storage', newPath);
    const [name] = file.filename.split('.');

    const compressedPath = `${rootFolder}/${name}.webp`;

    await sharp(file.path)
      .resize(800) // Змінює ширину до 800 пікселів, зберігаючи співвідношення сторін
      .webp({ quality: 75 }) // Конвертує в JPEG з якістю 70%
      .toFile(compressedPath); // Зберігає файл
    // Стиснення зображення

    // delete from temporary folder
    await fileDelete(file.path);

    //crate link for image
    const envValue = configService.get<string>('SERVER_IP');
    const coverPath = path.join('covers', `${name}.webp`);
    return `${envValue}${coverPath}`;
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException('Image compression failed', {
      cause: error,
    });
  }
};
