import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'database.json');

export async function readDatabase() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const initialData = { events: [], users: [], registrations: [] };
      await writeDatabase(initialData);
      return initialData;
    }
    throw error;
  }
}

export async function writeDatabase(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}