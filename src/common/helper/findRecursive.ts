import * as fs from 'fs/promises';
import * as path from 'path';

export async function findFileInCovers(
  storagePath: string,
  fileName: string,
): Promise<string | null> {
  async function searchFolder(folderPath: string): Promise<string | null> {
    try {
      const items = await fs.readdir(folderPath, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(folderPath, item.name);

        if (item.isDirectory()) {
          if (item.name === 'covers') {
            const foundFile = await findFileRecursive(itemPath, fileName);
            if (foundFile) return foundFile;
          } else {
            const foundFile = await searchFolder(itemPath);
            if (foundFile) return foundFile;
          }
        } else if (item.name === fileName) {
          // File found directly in folder
          return itemPath;
        }
      }
    } catch (error) {
      console.error(`Error accessing folder ${folderPath}: ${error.message}`);
    }
    return null;
  }

  // 1. Check in users folder directly
  const usersPath = path.join(storagePath, 'users');
  const foundInUsers = await searchFolder(usersPath);
  if (foundInUsers) return foundInUsers;

  // 2. Check in global covers folder
  const globalCovers = await searchFolder(path.join(storagePath, 'covers'));
  if (globalCovers) return globalCovers;

  // 3. Check in education covers folders
  const educationPath = path.join(storagePath, 'education');
  return await searchFolder(educationPath);
}

export async function findFileInMaterials(
  storagePath: string,
  fileName: string,
): Promise<string | null> {
  async function searchFolder(folderPath: string): Promise<string | null> {
    try {
      const items = await fs.readdir(folderPath, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(folderPath, item.name);

        if (item.isDirectory()) {
          if (item.name === 'materials') {
            // Search inside "materials" folders
            const foundFile = await findFileRecursive(itemPath, fileName);
            if (foundFile) return foundFile; // Return immediately if found
          } else {
            // Continue searching inside subdirectories
            const foundFile = await searchFolder(itemPath);
            if (foundFile) return foundFile; // Return if found in subdirectory
          }
        }
      }
    } catch (error) {
      console.error(`Error accessing folder ${folderPath}: ${error.message}`);
    }
    return null; // File not found
  }
  const educationPath = path.join(storagePath, 'education');
  const foundInEducation = await searchFolder(educationPath);
  if (foundInEducation) return foundInEducation;

  // 2️⃣ Якщо не знайдено — шукаємо у products/<id>/<fileName>
  const productsDir = path.join(storagePath, 'products');
  try {
    const products = await fs.readdir(productsDir, { withFileTypes: true });
    for (const dir of products) {
      if (dir.isDirectory()) {
        const filePath = path.join(productsDir, dir.name, fileName);
        console.log(filePath);
        // return filePath
        try {
          const stat = await fs.stat(filePath);
          if (stat.isFile()) {
            return filePath; // ✅ знайдено в products
          }
        } catch {
          // файл не знайдено у цій директорії
        }
      }
    }
  } catch (e: any) {
    console.error(`⚠️ Не вдалося прочитати products: ${e.message}`);
  }
}

export async function findFileRecursive(
  folderPath: string,
  fileName: string,
): Promise<string | null> {
  try {
    const items = await fs.readdir(folderPath, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(folderPath, item.name);

      if (item.isDirectory()) {
        // Recursively search inside subdirectories
        const foundPath = await findFileRecursive(itemPath, fileName);
        if (foundPath) return foundPath;
      } else if (item.name === fileName) {
        return itemPath; // Found the file, return its full path
      }
    }
  } catch (error) {
    console.error(`Error accessing folder ${folderPath}: ${error.message}`);
  }

  return null; // File not found
}
