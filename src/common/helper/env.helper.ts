import { existsSync } from 'fs';
import { resolve } from 'path';

export function getEnvPath(dest: string): string {
  const env: string | undefined = process.env.NODE_ENV;
  const filename: string = env ? `${env}.env` : '.env';

  // Спочатку шукаємо відносно переданого dest
  let filePath: string = resolve(`${dest}/${filename}`);

  if (!existsSync(filePath)) {
    // Потім шукаємо в root проекту
    filePath = resolve(process.cwd(), filename);
  }

  if (!existsSync(filePath)) {
    // На останок, шукаємо у dist/common/envs
    filePath = resolve(process.cwd(), 'dist/common/envs', filename);
  }

  console.log('Environment file path:', filePath);
  return filePath;
}
