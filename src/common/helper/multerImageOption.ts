import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multer from 'multer';
// import { v4 as uuidv4 } from 'uuid';

export const multerImageOptions = (): MulterOptions => ({
  storage: multer.diskStorage({
    destination: './temporary', // Директорія для збереження файлів
    filename: (req, file, callback) => {
      // Зміна імені файлу
      //   const [, ext] = file.originalname.split('.');
      //   const filename = `${Date.now()}_${uuidv4()}.${ext}`;
      callback(null, file.originalname);
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
