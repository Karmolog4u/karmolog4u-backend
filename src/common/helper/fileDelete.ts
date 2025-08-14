import { InternalServerErrorException } from '@nestjs/common';
import { promises as fs } from 'fs'; // Importing fs.promises
import * as path from 'path';

export const fileDelete = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath); // Using fs.promises.unlink
  } catch (error) {
    throw new InternalServerErrorException('Помилка обробки зображення :(');
  }
};

export const coverDeleteFromStorage = async (
  filePath: string,
): Promise<void> => {
  try {
    const file = path.join(process.cwd(), '..', 'storage', 'covers', filePath);
    // Перевірка чи існує файл
    await fs.access(file);

    // Якщо файл існує — видаляємо
    await fs.unlink(file);
  } catch (error) {
    // Якщо помилка access — файл не існує, не видаляємо
    if (error.code === 'ENOENT') {
      return;
    }

    throw new InternalServerErrorException('Помилка обробки зображення :(');
  }
};
