import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const photosDir = path.join(__dirname, '../src/content/photos');

async function migrate() {
    try {
        const files = await fs.readdir(photosDir);
        let count = 0;

        for (const file of files) {
            if (!file.endsWith('.json')) continue;

            const filePath = path.join(photosDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);

            if (data.cloudinaryId) {
                data.imageId = data.cloudinaryId;
                delete data.cloudinaryId;

                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
                count++;
            }
        }

        console.log(`Migrated ${count} files.`);
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
