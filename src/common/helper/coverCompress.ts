import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { fileDelete } from './fileDelete';
import * as path from 'path';

export const coverCompress = async (
  fileLink: string,
  destination: string,
  configService: ConfigService,
) => {
  try {
    const fileName = getCoverNameFromUrl(fileLink);
    const filePath = path.join('temporaryCovers', fileName);
    const [name] = fileName.split('.');
    const compressedPath = path.join(destination, `${name}.webp`);

    try {
      await sharp(filePath)
        .resize(800) // Resize the image
        .webp({ quality: 75 }) // Convert to WebP format
        .toFile(compressedPath); // Save compressed file
    } catch (error) {
      throw new InternalServerErrorException(
        `Помилка стискання зображення: ${error.message}`,
      );
    }
    await fileDelete(filePath);

    // Generate the accessible link for the compressed image
    const envValue = configService.get<string>('SERVER_IP');
    console.log('envValue', envValue);

    const coverPath = path.join('covers', `${name}.webp`);
    console.log('cover path ', coverPath);

    return `${envValue}${coverPath}`;
  } catch (error) {
    throw new HttpException(
      {
        status: error.status || 500,
        message:
          error.response?.message ||
          'An error occurred while processing the file',
        error: error.response?.error || 'Internal Server Error',
      },
      error.status || 500,
      {
        cause: error,
      },
    );
  }
};

function getCoverNameFromUrl(url: string): string {
  const parts = url.split('/'); // Split by "/"
  return parts[parts.length - 1]; // Get the last part (filename)
}
