import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const rootPath = path.join(path.dirname(__filename), '..', '..');
export function basePath(...paths) {
  return path.join(rootPath, ...paths);
}
