import * as fs from 'fs/promises';
import * as path from 'path';

export async function createFolder(folderPath: string): Promise<string> {
  // const folderPath = path.join(process.cwd(), '..', 'storage'); // Шлях до папки

  try {
    // Перевіряємо, чи існує папка
    try {
      await fs.access(folderPath);
      console.log(`Папка вже існує: ${folderPath}`);
      logFilesInFolder(folderPath);
      return folderPath;
    } catch {
      // Якщо папка не існує, створюємо її
      await fs.mkdir(folderPath, { recursive: true });
      console.log(`Папка створена успішно: ${folderPath}`);
      return folderPath;
    }
  } catch (error) {
    console.error(`Помилка при створенні папки: ${error.message}`);
    throw error;
  }
}
export async function logFilesInFolder(folderPath: string): Promise<void> {
  try {
    // Перевіряємо, чи існує папка
    await fs.access(folderPath);

    // Читаємо вміст папки
    const files = await fs.readdir(folderPath);

    if (files.length === 0) {
      console.log(`Папка пуста: ${folderPath}`);
    } else {
      console.log(`Файли в ${folderPath}:`);
      files.forEach((file) => console.log(file));
    }
  } catch (error) {
    console.error(`Помилка доступу до папки: ${error.message}`);
  }
}

// export async function createFolder(folderPath): Promise<string> {
//   //   const folderPath = path.join(process.cwd(), '..', 'storage'); // Шлях до папки

//   try {
//     // Перевіряємо, чи існує папка
//     try {
//       await fs.access(folderPath);
//       console.log(`Папка вже існує: ${folderPath}`);
//       //   logFilesInFolder(folderPath);
//       return folderPath;
//     } catch {
//       // Якщо папка не існує, створюємо її
//       await fs.mkdir(folderPath, { recursive: true });
//       console.log(`Папка створена успішно: ${folderPath}`);
//       return folderPath;
//     }
//   } catch (error) {
//     console.error(`Помилка при створенні папки: ${error.message}`);
//     throw error;
//   }
// }

export async function createStorageFolder() {
  const storageFolder = path.join(process.cwd(), '..', 'storage'); // Шлях до папки
  const educationFolder = path.join(
    process.cwd(),
    '..',
    'storage',
    'education',
  ); // Шлях до папки
  const coversFolder = path.join(process.cwd(), '..', 'storage', 'covers'); // Шлях до папки
  await createFolder(storageFolder);
  await createFolder(educationFolder);
  await createFolder(coversFolder);
}
