import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multer from 'multer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerOptions = (): MulterOptions => ({
  storage: multer.diskStorage({
    destination: './temporaryCovers', // Директорія для збереження файлів
    filename: (req, file, callback) => {
      // Зміна імені файлу
      const ext = file.originalname.split('.');
      const filename = `${Date.now()}_${uuidv4()}.${ext[ext.length - 1]}`;
      callback(null, `${filename}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    // Перевірка MIME-типу
    if (file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      callback(null, true); // Приймаємо тільки зображення
    } else {
      callback(new Error('Only image files are allowed!'), false); // Відхиляємо файли
    }
  },
});

export const multerOptionsFiles = (): MulterOptions => ({
  storage: multer.diskStorage({
    destination: './temporaryFiles', // Директорія для збереження файлів
    filename: async (req, file, callback) => {
      // console.log('file.originalname', file.originalname);
      console.log(process.cwd());

      const originalName = normalizeFilename(file.originalname); // Правильне ім'яs

      const ext = path.extname(originalName);
      // const nameWithoutExt = path.basename(originalName, ext);
      const filename = `${Date.now()}_${uuidv4()}${Date.now()}${ext}`;
      const filePath = path.join(process.cwd(), 'temporaryFiles', filename);
      // console.log('filePath', filePath);

      // let copyIndex = 1;

      // // Перевіряємо, чи файл вже існує та додаємо префікс (copy_X)
      // while (await fileExists(filePath)) {
      //   filename = `${nameWithoutExt}(copy_${copyIndex})${ext}`;
      //   filePath = path.join(process.cwd(), 'temporaryFiles', filename); // Оновлюємо шлях
      //   copyIndex++;
      // }

      callback(null, filename);
    },
  }),
  limits: { files: 10, fileSize: 100 * 1024 * 1024 }, // Limit: Max 10 files, 10MB each
  // fileFilter: (req, file, callback) => {
  //   const allowedMimeTypes = [
  //     'image/jpeg',
  //     'image/png',
  //     'image/webp',
  //     'application/pdf',
  //     'application/vnd.ms-excel',
  //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //     'application/vnd.ms-powerpoint',
  //     'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  //   ];

  //   if (allowedMimeTypes.includes(file.mimetype)) {
  //     callback(null, true); // ✅ Accept file
  //   } else {
  //     callback(new Error('Only image files are allowedjjjjjj!'), false); // Відхиляємо файли
  //   }
  // },
});

// Функція перевірки існування файлу
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true; // Файл існує
  } catch {
    return false; // Файл не знайдено
  }
}

function normalizeFilename(filename: string): string {
  return filename.normalize('NFC'); // Нормалізація юнікоду
}
