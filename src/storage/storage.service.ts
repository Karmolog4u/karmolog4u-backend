import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  findFileInMaterials,
  findFileInCovers,
} from 'src/common/helper/findRecursive';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class StorageService {
  constructor(
    private readonly configService: ConfigService,
    private readonly filesService: FilesService,
  ) {}

  async getCover(fileName: string) {
    const rootFolder = path.join(process.cwd(), '..', 'storage'); // Коренева папка для пошуку
    const filePath = await findFileInCovers(rootFolder, fileName);
    return filePath;
  }

  async getFile(fileName: string) {
    const file = await this.filesService.getFilesBySavedName(fileName);
    const rootFolder = path.join(process.cwd(), '..', 'storage'); // Коренева папка для пошуку
    // const filePath = await findFileInMaterials(rootFolder, fileName);
    return { file: file[0], rootFolder };
  }

  getTemporaryCover(fileName: string) {
    const filePath = path.join(process.cwd(), 'temporaryCovers', fileName); // Коренева папка для пошуку
    return filePath;
  }

  getTemporaryFile(fileName: string) {
    const filePath = path.join(process.cwd(), 'temporaryFiles', fileName); // Коренева папка для пошуку
    return filePath;
  }

  async createFolder(folderPath: string): Promise<string> {
    try {
      // Перевіряємо, чи існує папка
      try {
        await fs.access(folderPath);
        console.log(`Папка вже існує: ${folderPath}`);
        this.logFilesInFolder(folderPath);
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

  async logFilesInFolder(folderPath: string): Promise<void> {
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

  async createCourseStorage(courseId: string): Promise<string> {
    try {
      const courseFolder = path.join(
        process.cwd(),
        '..',
        'storage',
        'education',
        courseId,
      ); // Шлях до папки
      await fs.mkdir(courseFolder, { recursive: true });

      const folders = ['covers', 'materials'];

      for (const folder of folders) {
        const fullPath = path.join(courseFolder, folder);
        await fs.mkdir(fullPath, { recursive: true }); // Створює папку, якщо її не існує
      }

      console.log(`Сховище курсу створено: ${courseFolder}`);
      return courseFolder;
    } catch (error) {
      throw new BadRequestException('Помилка створення сховища :(');
    }
  }

  async createUserStorage(userId: string): Promise<string> {
    try {
      const userFolder = path.join(
        process.cwd(),
        '..',
        'storage',
        'users',
        userId,
      ); // Шлях до папки
      await fs.mkdir(userFolder, { recursive: true });

      console.log(`Сховище користувача створено: ${userFolder}`);
      return userFolder;
    } catch (error) {
      throw new BadRequestException('Помилка створення сховища :(');
    }
  }

  async createLessonStorage(lessonId: string): Promise<string> {
    try {
      const lessonFolder = path.join(
        process.cwd(),
        '..',
        'storage',
        'education',
        lessonId,
      ); // Шлях до папки
      await fs.mkdir(lessonFolder, { recursive: true });

      console.log(`Сховище уроку створено: ${lessonFolder}`);
      return lessonFolder;
    } catch (error) {
      throw new BadRequestException('Помилка створення сховища :(');
    }
  }

  async createProductStorage(productId: string): Promise<string> {
    try {
      const productFolder = path.join(
        process.cwd(),
        '..',
        'storage',
        'products',
        productId,
      ); // Шлях до папки
      await fs.mkdir(productFolder, { recursive: true });

      console.log(`Сховище продукту створено: ${productFolder}`);
      return productFolder;
    } catch (error) {
      throw new BadRequestException('Помилка створення сховища :(');
    }
  }

  async createStorageFolder() {
    const storageFolder = path.join(process.cwd(), '..', 'storage'); // Шлях до папки
    const educationFolder = path.join(
      process.cwd(),
      '..',
      'storage',
      'education',
    ); // Шлях до папки
    const coversFolder = path.join(process.cwd(), '..', 'storage', 'covers'); // Шлях до папки
    const usersFolder = path.join(process.cwd(), '..', 'storage', 'users'); // Шлях до папки
    const productsFolder = path.join(
      process.cwd(),
      '..',
      'storage',
      'products',
    ); // Шлях до папки
    await this.createFolder(storageFolder);
    await this.createFolder(educationFolder);
    await this.createFolder(coversFolder);
    await this.createFolder(usersFolder);
    await this.createFolder(productsFolder);
  }

  // async moveFiles(
  //   fileLinks: string[],
  //   tempFolder: string,
  //   storageFolder: string,
  // ): Promise<string[]> {
  //   try {
  //     await fs.mkdir(storageFolder, { recursive: true }); // Ensure storage folder exists

  //     const updatedLinks: string[] = [];

  //     for (const fileLink of fileLinks) {
  //       const fileName = path.basename(fileLink); // Extract filename from URL or path
  //       const tempPath = path.join(tempFolder, fileName); // Temporary file path
  //       const storagePath = path.join(storageFolder, fileName); // New storage location

  //       await fs.rename(tempPath, storagePath); // Move file
  //       console.log(`Moved: ${fileName} → ${storagePath}`);

  //       // Update the link to replace "temporaryCovers" with "covers"
  //       const updatedLink = fileLink.replace('/temporaryFiles/', '/file/');
  //       updatedLinks.push(updatedLink);
  //     }

  //     return updatedLinks;
  //   } catch (error) {
  //     console.error(`Error moving files: ${error.message}`);
  //     return [];
  //   }
  // }
  getTempFilesFolder() {
    const filePath = path.join(process.cwd(), 'temporaryFiles');
    return filePath;
  }
  getTempCoversFolder() {
    const filePath = path.join(process.cwd(), 'temporaryCovers');
    return filePath;
  }
  getSubFolderPath(rootPath: string, subFolder: string) {
    const filePath = path.join(rootPath, subFolder);
    return filePath;
  }

  getPathTempCover(fileName: string) {
    const filePath = path.join('temporaryCovers', fileName);
    return filePath;
  }

  async coverExists(folderPath: string, fileName: string): Promise<boolean> {
    const filePath = path.join(folderPath, fileName);

    try {
      await fs.access(filePath); // Check if the file is accessible
      return true; // File exists
    } catch {
      return false; // File does not exist
    }
  }

  async filterExistingFiles(files: any[]): Promise<any[]> {
    const existingFiles: string[] = [];

    for (const file of files) {
      const filePath = path.join(process.cwd(), file?.path);

      try {
        await fs.access(filePath); // Check if the file exists
        existingFiles.push(file); // Add to the result array if it exists
      } catch {
        // File does not exist, do nothing
      }
    }
    return existingFiles;
  }

  async copyFiles(destinationFolder: string, files: any[]): Promise<any[]> {
    try {
      await fs.mkdir(destinationFolder, { recursive: true }); // Ensure destination exists

      const copiedFiles: any[] = [];

      for (const file of files) {
        const sourcePath = path.join(process.cwd(), file.path);
        const destinationPath = path.join(destinationFolder, file.savedName);

        try {
          // copy file to destination folder
          await fs.copyFile(sourcePath, destinationPath); // Copy file
          // console.log(`Copied: ${file.savedName}`);
          const relativePath = path.relative(
            this.getStoragePath(),
            destinationPath,
          );
          copiedFiles.push({ ...file, path: relativePath });
        } catch (error) {
          console.error(`Failed to copy ${file.savedName}: ${error.message}`);
        }
      }
      return copiedFiles;
    } catch (error) {
      console.error(`Error creating destination folder: ${error.message}`);
    }
  }
  async deleteFiles(rootPath: string, files: any[]): Promise<void> {
    // const existingFiles = await this.filterExistingFiles(files);
    for (const existingFile of files) {
      const filePath = path.join(rootPath, existingFile.path);

      try {
        await fs.unlink(filePath); // Deletes the file
      } catch (error) {
        console.error(`❌ Error deleting ${existingFile}: ${error.message}`);
      }
    }
  }

  getCourseFilePath(courseId: any, subFolder: string) {
    const filePath = path.join(
      process.cwd(),
      '..',
      'storage',
      'education',
      courseId,
      subFolder,
    ); // Коренева папка для пошуку

    return filePath;
  }
  getLessonFilePath(Id: any) {
    const filePath = path.join(process.cwd(), '..', 'storage', 'education', Id); // Коренева папка для пошуку
    return filePath;
  }

  getProductFilePath(Id: any) {
    const filePath = path.join(process.cwd(), '..', 'storage', 'products', Id); // Коренева папка для пошуку
    return filePath;
  }

  getStoragePath() {
    const storagePath = path.join(process.cwd(), '..', 'storage');
    return storagePath;
  }
  async deleteCourseFolder(ids: any) {
    //convert mongo id to string
    const folderNames = ids.map((id) => id.toHexString());
    const basePath = path.join(process.cwd(), '..', 'storage', 'education'); // Шлях до папки
    try {
      //check exist folders in storage
      const existingFolder = await this.getExistingFolders(
        basePath,
        folderNames,
      );
      //delete existing folder
      await this.deleteFolders(existingFolder);
      return;
    } catch (error) {
      console.error(`❌ Error deleting folder: ${error.message}`);
      throw new BadRequestException('Не вдалося видалити файли курсу');
    }
  }

  async deleteLessonFolder(ids: any) {
    //convert mongo id to string
    const folderNames = ids.map((id) => id.toHexString());
    const basePath = path.join(process.cwd(), '..', 'storage', 'education'); // Шлях до папки
    try {
      //check exist folders in storage
      const existingFolder = await this.getExistingFolders(
        basePath,
        folderNames,
      );
      //delete existing folder
      await this.deleteFolders(existingFolder);
      return;
    } catch (error) {
      console.error(`❌ Error deleting folder: ${error.message}`);
      throw new BadRequestException('Не вдалося видалити файли курсу');
    }
  }

  async getExistingFolders(
    basePath: string,
    folderNames: string[],
  ): Promise<string[]> {
    const existingFolders: string[] = [];

    await Promise.all(
      folderNames.map(async (folderName) => {
        const folderPath = path.join(basePath, folderName);
        try {
          const stat = await fs.stat(folderPath);
          if (stat.isDirectory()) {
            existingFolders.push(folderPath);
          }
        } catch {
          // Ігноруємо, якщо папки не існує або не доступна
        }
      }),
    );

    return existingFolders;
  }

  async deleteFolders(folders: string[]): Promise<string[]> {
    const deleted: string[] = [];

    for (const folder of folders) {
      try {
        await fs.rm(folder, { recursive: true, force: true });
        console.log(`🗑️ Deleted folder: ${folder}`);
        deleted.push(folder);
      } catch (err) {
        console.warn(`❗ Не вдалося видалити ${folder}:`, err);
      }
    }

    return deleted;
  }
}
