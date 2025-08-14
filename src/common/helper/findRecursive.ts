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
            // Search inside "covers" folders
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

  // Check in the global "covers" folder first
  const globalCovers = await searchFolder(path.join(storagePath));
  if (globalCovers) return globalCovers; // Return immediately if found

  // Check in all course "covers" folders inside "education/"
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

  // Search in the "education" directory for any "materials" folders
  const educationPath = path.join(storagePath, 'education');
  return await searchFolder(educationPath);
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
